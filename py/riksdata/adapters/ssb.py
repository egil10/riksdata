"""SSB Statbank adapter (PxWeb API v2). Endpoints and quirks: docs/v2/sources/ssb.md."""

from __future__ import annotations

import itertools
import json
import logging
import math
import re
from datetime import UTC, datetime
from typing import Any

import polars as pl

from riksdata.adapters.base import Batch, RawArtifact, assemble_batch
from riksdata.http import HttpClient
from riksdata.periods import parse_period
from riksdata.registry import DatasetSpec, Source

logger = logging.getLogger(__name__)

MAX_CELLS = 800_000  # SSB's limit per data request (`maxDataCells` in /config)
CATALOG_PAGE_SIZE = 10_000

_CATALOG_SCHEMA: dict[str, pl.DataType] = {
    "id": pl.String(),
    "label_no": pl.String(),
    "label_en": pl.String(),
    "updated": pl.String(),
    "first_period": pl.String(),
    "last_period": pl.String(),
    "time_unit": pl.String(),
    "subject_code": pl.String(),
    "variable_names": pl.List(pl.String()),
    "discontinued": pl.Boolean(),
}


def _is_expression(code: str) -> bool:
    """True for PxWeb selection expressions such as `*`, `top(3)` or `from(2020)`."""
    return any(char in code for char in "*?(")


def _ordered_codes(category: dict[str, Any]) -> list[str]:
    index = category["index"]
    return sorted(index, key=index.get) if isinstance(index, dict) else list(index)


def _expand(cells: Any, size: int) -> list[Any]:
    """json-stat `value`/`status` may be a list, a sparse {position: value} object or a scalar."""
    if cells is None:
        return [None] * size
    if isinstance(cells, dict):
        return [cells.get(str(position)) for position in range(size)]
    if isinstance(cells, list):
        if len(cells) != size:
            raise ValueError(f"expected {size} cells, got {len(cells)}")
        return cells
    return [cells] * size


def _slug(code: str) -> str:
    return re.sub(r"[^a-z0-9-]+", "_", code.lower()).strip("_")


def _label(dimensions: dict[str, Any], dim: str, code: str) -> str:
    """A code's label with whitespace tidied (SSB has stray tabs); the code itself if missing."""
    label = dimensions.get(dim, {}).get("category", {}).get("label", {}).get(code, code)
    return " ".join(label.split())


def _title(base: str | None, labels: list[str]) -> str | None:
    if base is None:
        return None
    return f"{base}: {', '.join(labels)}" if labels else base


def _timestamp(text: str) -> datetime:
    return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone(UTC)


def check_selection(ds: DatasetSpec, metadata: dict[str, Any]) -> None:
    """Fail early, with a clear message, if `select` doesn't fit the table's metadata."""
    dimensions = {
        dim: _ordered_codes(metadata["dimension"][dim]["category"]) for dim in metadata["id"]
    }
    missing = [dim for dim in dimensions if dim not in ds.select]
    unknown = [dim for dim in ds.select if dim not in dimensions]
    if missing or unknown:
        raise ValueError(
            f"{ds.key}: `select` must list exactly the table's dimensions {list(dimensions)} "
            f"(missing: {missing}, unknown: {unknown}). SSB returns a default subset for "
            "dimensions that are left out."
        )
    cells = 1
    for dim, wanted in ds.select.items():
        bad = [code for code in wanted if not _is_expression(code) and code not in dimensions[dim]]
        if bad:
            raise ValueError(f"{ds.key}: {dim} has no codes {bad}; check the table's metadata")
        explicit = not any(_is_expression(code) for code in wanted)
        cells *= len(wanted) if explicit else len(dimensions[dim])
    if cells > MAX_CELLS:
        raise ValueError(
            f"{ds.key}: selection is {cells} cells; SSB allows {MAX_CELLS} per request"
        )


class SsbAdapter:
    source_id = "ssb"

    def __init__(self, source: Source, client: HttpClient) -> None:
        self._source = source
        self._client = client

    def _tables(self, lang: str, include_discontinued: bool) -> list[dict[str, Any]]:
        params = {"lang": lang, "pageSize": str(CATALOG_PAGE_SIZE)}
        if include_discontinued:
            params["includeDiscontinued"] = "true"
        tables: list[dict[str, Any]] = []
        page = 1
        while True:
            body = self._client.get(
                f"{self._source.api_base}/tables", params={**params, "pageNumber": str(page)}
            ).json()
            tables += body["tables"]
            if page >= body["page"]["totalPages"]:
                return tables
            page += 1

    def catalog(self, *, include_discontinued: bool = False) -> pl.DataFrame:
        """Every table in the Statbank, with Norwegian and English titles."""
        english = {table["id"]: table for table in self._tables("en", include_discontinued)}
        rows = [
            {
                "id": table["id"],
                "label_no": table.get("label"),
                "label_en": english.get(table["id"], {}).get("label"),
                "updated": table.get("updated"),
                "first_period": table.get("firstPeriod"),
                "last_period": table.get("lastPeriod"),
                "time_unit": table.get("timeUnit"),
                "subject_code": table.get("subjectCode"),
                "variable_names": english.get(table["id"], {}).get("variableNames"),
                "discontinued": bool(table.get("discontinued", False)),
            }
            for table in self._tables("no", include_discontinued)
        ]
        return pl.DataFrame(rows, schema=_CATALOG_SCHEMA).sort("id")

    def remote_updated(self, ds: DatasetSpec) -> datetime | None:
        info = self._client.get(
            f"{self._source.api_base}/tables/{ds.dataset}", params={"lang": "en"}
        ).json()
        if info.get("discontinued"):
            logger.warning(
                "SSB TABLE %s IS DISCONTINUED (%s). Find the table that replaces it and set "
                "`superseded_by` in registry/datasets/ssb.yaml.",
                ds.dataset,
                info.get("label"),
            )
        return _timestamp(info["updated"])

    def fetch(self, ds: DatasetSpec) -> RawArtifact:
        """Fetch the data in Norwegian, plus the table's English metadata for `title_en`."""
        table = f"{self._source.api_base}/tables/{ds.dataset}"
        metadata_en = self._client.get(f"{table}/metadata", params={"lang": "en"}).json()
        check_selection(ds, metadata_en)
        params = {"lang": "no", "outputFormat": "json-stat2"}
        params |= {f"valueCodes[{dim}]": ",".join(codes) for dim, codes in ds.select.items()}
        response = self._client.get(f"{table}/data", params=params)
        return RawArtifact(
            url=str(response.url),
            fetched_at=datetime.now(UTC),
            content_type=response.headers.get("content-type", "application/json"),
            content=response.content,
            meta={"metadata_en": metadata_en},
        )

    def normalize(self, raw: RawArtifact, ds: DatasetSpec) -> Batch:
        """json-stat2 cube to long format: one series per combination of the `series_key` codes."""
        if ds.entity is None or ds.frequency is None:
            raise ValueError(f"{ds.key}: SSB datasets need `entity` and `frequency`")
        data = json.loads(raw.content)
        dimensions: dict[str, Any] = data["dimension"]
        english: dict[str, Any] = raw.meta["metadata_en"]["dimension"]
        dims: list[str] = data["id"]
        roles = data.get("role", {})
        if len(roles.get("time", [])) != 1 or len(roles.get("metric", [])) != 1:
            raise ValueError(f"{ds.key}: expected one time and one metric dimension, got {roles}")
        time_dim, metric_dim = roles["time"][0], roles["metric"][0]
        codes = {dim: _ordered_codes(dimensions[dim]["category"]) for dim in dims}
        series_dims = [dim for dim in dims if dim != time_dim]

        unknown = [dim for dim in ds.series_key if dim not in series_dims]
        loose = [dim for dim in series_dims if dim not in ds.series_key and len(codes[dim]) > 1]
        if unknown or loose or not ds.series_key:
            raise ValueError(
                f"{ds.key}: `series_key` {ds.series_key} must name non-time dimensions "
                f"{series_dims} and include every one with more than one value "
                f"(unknown: {unknown}, not in the key: {loose})"
            )

        periods = {code: parse_period(code) for code in codes[time_dim]}
        off_frequency = sorted({p.frequency for p in periods.values()} - {ds.frequency})
        if off_frequency:
            raise ValueError(
                f"{ds.key}: registry says frequency {ds.frequency}, data has {off_frequency}"
            )

        # json-stat lists cells in row-major order: the last dimension varies fastest.
        size = math.prod(len(codes[dim]) for dim in dims)
        cells = pl.DataFrame(
            list(itertools.product(*(codes[dim] for dim in dims))),
            schema=[(dim, pl.String) for dim in dims],
            orient="row",
        ).with_columns(
            pl.Series("value", _expand(data["value"], size), dtype=pl.Float64, strict=False),
            pl.Series("status", _expand(data.get("status"), size), dtype=pl.String),
        )

        # Titles name only the dimensions that vary; the registry title covers the fixed ones.
        varying = [dim for dim in series_dims if len(codes[dim]) > 1]
        units = dimensions[metric_dim]["category"].get("unit", {})
        source_updated = _timestamp(data["updated"])
        series_rows: list[dict[str, Any]] = []
        key_rows: list[dict[str, str]] = []
        for combo in itertools.product(*(codes[dim] for dim in series_dims)):
            code = dict(zip(series_dims, combo, strict=True))
            key = "_".join(_slug(code[dim]) for dim in ds.series_key)
            series_id = f"{self.source_id}.{ds.dataset}.{key}"
            key_rows.append({**code, "series_id": series_id})
            series_rows.append(
                {
                    "series_id": series_id,
                    "source_id": self.source_id,
                    "dataset_id": ds.dataset,
                    "dims": json.dumps(code, ensure_ascii=False),
                    "title_no": _title(
                        ds.title_no, [_label(dimensions, dim, code[dim]) for dim in varying]
                    ),
                    "title_en": _title(
                        ds.title_en, [_label(english, dim, code[dim]) for dim in varying]
                    ),
                    "unit": units.get(code[metric_dim], {}).get("base"),
                    "unit_mult": 0,
                    "frequency": ds.frequency,
                    "concept": None,
                    "coverage": None,
                    "topic": ds.topic,
                    "tag": "DATA",
                    "estimate_by": None,
                    "publish": ds.publish,
                    "source_url": f"https://www.ssb.no/statbank/table/{ds.dataset}",
                    "citation": f"{self._source.attribution}, tabell {ds.dataset}",
                    "licence": self._source.licence,
                    "source_updated": source_updated,
                    "retrieved_at": raw.fetched_at,
                }
            )
        if len({row["series_id"] for row in series_rows}) != len(series_rows):
            raise ValueError(f"{ds.key}: `series_key` {ds.series_key} gives duplicate series ids")

        keys = pl.DataFrame(
            key_rows, schema=[(dim, pl.String) for dim in [*series_dims, "series_id"]]
        )
        calendar = pl.DataFrame(
            [(code, period.period, period.period_start) for code, period in periods.items()],
            schema=[(time_dim, pl.String), ("period", pl.String), ("period_start", pl.Date)],
            orient="row",
        )
        observations = (
            cells.join(keys, on=series_dims)
            .join(calendar, on=time_dim)
            .with_columns(
                entity_id=pl.lit(ds.entity),
                vintage=pl.lit(raw.fetched_at.astimezone(UTC).date()),
            )
        )
        return assemble_batch(series_rows, observations)
