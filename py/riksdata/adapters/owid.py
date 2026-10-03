"""Our World in Data adapter (grapher charts). Endpoints and quirks: docs/v2/sources/owid.md."""

from __future__ import annotations

import io
import json
from datetime import UTC, date, datetime
from typing import Any

import polars as pl

from riksdata.adapters.base import Batch, RawArtifact, assemble_batch
from riksdata.http import HttpClient
from riksdata.periods import parse_period
from riksdata.registry import DatasetSpec, Source

_QUERY = {"v": "1", "csvType": "full", "useColumnShortNames": "true"}
_ENTITY_IDS = {"OWID_WRL": "WORLD"}  # OWID's own codes -> Riksdata entity ids
_TIME_COLUMNS = {"year": "A", "day": "D"}
_PROJECTED = "__projected"  # OWID's suffix on CSV columns that hold projections


def _value_columns(metadata: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Numeric columns of a chart, by short name. Skips annotations such as `owid_region`."""
    return {
        short: column
        for short, column in metadata["columns"].items()
        if column.get("type") == "Numeric"
    }


def _licence(indicator: dict[str, Any]) -> str | None:
    """The upstream licences OWID records for an indicator, in order and without repeats."""
    names = [(origin.get("license") or {}).get("name") for origin in indicator.get("origins", [])]
    return "; ".join(dict.fromkeys(name.strip() for name in names if name)) or None


def _midnight(day: str) -> datetime:
    return datetime.fromisoformat(day).replace(tzinfo=UTC)


def _period(ds: DatasetSpec, text: str, frequency: str) -> tuple[str, date]:
    try:
        parsed = parse_period(f"{int(text):04d}" if frequency == "A" else text)
    except ValueError as exc:
        raise ValueError(f"{ds.key}: cannot use {text!r} as a period: {exc}") from exc
    return parsed.period, parsed.period_start


class OwidAdapter:
    source_id = "owid"

    def __init__(self, source: Source, client: HttpClient) -> None:
        self._source = source
        self._client = client
        # remote_updated() and fetch() both need the chart metadata; ask for it once per run.
        self._metadata: dict[str, dict[str, Any]] = {}

    def catalog(self, *, include_discontinued: bool = False) -> None:
        return None

    def _chart_metadata(self, slug: str) -> dict[str, Any]:
        if slug not in self._metadata:
            url = f"{self._source.api_base}/{slug}.metadata.json"
            self._metadata[slug] = self._client.get(url, params=_QUERY).json()
        return self._metadata[slug]

    def remote_updated(self, ds: DatasetSpec) -> datetime | None:
        columns = _value_columns(self._chart_metadata(ds.dataset)).values()
        dates = [column["lastUpdated"] for column in columns if column.get("lastUpdated")]
        return max(_midnight(day) for day in dates) if dates else None

    def fetch(self, ds: DatasetSpec) -> RawArtifact:
        """Fetch the full CSV, plus chart metadata and each indicator's own metadata.

        The indicator metadata is where OWID records the upstream licences.
        """
        metadata = self._chart_metadata(ds.dataset)
        indicators = {
            short: self._client.get(column["fullMetadata"]).json()
            for short, column in _value_columns(metadata).items()
            if column.get("fullMetadata")
        }
        response = self._client.get(f"{self._source.api_base}/{ds.dataset}.csv", params=_QUERY)
        return RawArtifact(
            url=str(response.url),
            fetched_at=datetime.now(UTC),
            content_type=response.headers.get("content-type", "text/csv"),
            content=response.content,
            meta={"metadata": metadata, "indicators": indicators},
        )

    def normalize(self, raw: RawArtifact, ds: DatasetSpec) -> Batch:
        """Wide CSV to long format: one series per numeric column, filtered to `ds.entities`."""
        if not ds.entities:
            raise ValueError(f"{ds.key}: OWID datasets need `entities`")
        columns = _value_columns(raw.meta["metadata"])
        indicators: dict[str, Any] = raw.meta["indicators"]

        table = pl.read_csv(io.BytesIO(raw.content), infer_schema=False)
        table = table.rename({name: name.lower() for name in table.columns[:3]})
        time_column = next((name for name in _TIME_COLUMNS if name in table.columns), None)
        if "code" not in table.columns or time_column is None:
            raise ValueError(
                f"{ds.key}: expected entity, code and year or day columns, got {table.columns[:3]}"
            )
        frequency = _TIME_COLUMNS[time_column]
        if ds.frequency not in (None, frequency):
            raise ValueError(
                f"{ds.key}: registry says frequency {ds.frequency}, data is {frequency}"
            )
        table = table.filter(pl.col("code").is_in(ds.entities))

        times = table[time_column].unique().to_list()
        calendar = pl.DataFrame(
            [(text, *_period(ds, text, frequency)) for text in times],
            schema=[(time_column, pl.String), ("period", pl.String), ("period_start", pl.Date)],
            orient="row",
        )

        series_rows: list[dict[str, Any]] = []
        frames: list[pl.DataFrame] = []
        for short, column in columns.items():
            csv_name = next(
                (name for name in (short, short + _PROJECTED) if name in table.columns), None
            )
            if csv_name is None:
                raise ValueError(f"{ds.key}: the CSV has no column for {short!r}")
            projected = csv_name.endswith(_PROJECTED)
            single = len(columns) == 1
            series_id = f"{self.source_id}.{ds.dataset}" + ("" if single else f".{short}")
            indicator = indicators.get(short, {})
            long_title = column.get("titleLong") or column.get("titleShort") or short
            series_rows.append(
                {
                    "series_id": series_id,
                    "source_id": self.source_id,
                    "dataset_id": ds.dataset,
                    "dims": json.dumps({"column": short}),
                    "title_no": ds.title_no if single else f"{ds.title_no}: {long_title}",
                    "title_en": column.get("titleShort", long_title) if single else long_title,
                    "unit": column.get("unit") or None,
                    "unit_mult": 0,
                    "frequency": frequency,
                    "concept": None,
                    "coverage": None,
                    "topic": ds.topic,
                    "tag": "ESTIMATE" if projected else "DATA",
                    "estimate_by": "publisher" if projected else None,
                    "publish": ds.publish and not indicator.get("nonRedistributable", False),
                    "source_url": f"{self._source.api_base}/{ds.dataset}",
                    "citation": column.get("citationShort"),
                    "licence": _licence(indicator),
                    "source_updated": _midnight(column["lastUpdated"])
                    if column.get("lastUpdated")
                    else None,
                    "retrieved_at": raw.fetched_at,
                }
            )
            frames.append(
                table.select(
                    pl.lit(series_id).alias("series_id"),
                    pl.col("code").replace(_ENTITY_IDS).alias("entity_id"),
                    time_column,
                    pl.col(csv_name).cast(pl.Float64).alias("value"),
                ).drop_nulls("value")  # a blank cell is CSV padding, not a published gap
            )

        observations = (
            pl.concat(frames)
            .join(calendar, on=time_column)
            .with_columns(
                status=pl.lit(None, dtype=pl.String),
                vintage=pl.lit(raw.fetched_at.astimezone(UTC).date()),
            )
        )
        return assemble_batch(series_rows, observations)
