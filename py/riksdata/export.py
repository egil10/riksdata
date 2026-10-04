"""Export the publishable part of the lake as small JSON files for the site (PLAN.md §3).

Only series with `publish = true` are exported. The output is what the beta page reads:

    catalog.json           one entry per series: metadata, latest value, change and a sparkline
    series/<series_id>.json  {meta, entities: {<entity_id>: {period: [...], value: [...]}}}
    sources.json           the latest `riksdata check-sources` report, without response content
    build.json             when the export ran, counts, and the latest validation result
"""

from __future__ import annotations

import json
import re
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any, cast

import polars as pl

from riksdata import storage
from riksdata.registry import DatasetSpec, Registry

DEFAULT_OUT_DIR = Path("beta") / "data"
HOME_ENTITY = "NOR"
SPARK_YEARS = 20
SPARK_POINTS = 80

_SERIES_META = [
    "series_id",
    "source_id",
    "dataset_id",
    "title_no",
    "title_en",
    "unit",
    "frequency",
    "topic",
    "tag",
    "estimate_by",
    "source_url",
    "citation",
    "licence",
    "first_period",
    "last_period",
]
_SOURCE_FIELDS = [
    "id",
    "section",
    "name",
    "priority",
    "status",
    "detail",
    "http_status",
    "checked_at",
]
_SECTION_HEADING = re.compile(r"^#{2,3} (\d+[a-d]?)\. (.+)$")


def _decimals(values: pl.Series) -> int:
    """How many decimals to show for a series: what the data has, at most 2, fewer if large."""
    size = cast("float | None", values.abs().max())
    if size is None or size >= 1000:
        return 0
    most = 1 if size >= 100 else 2
    for digits in range(most):
        if cast("float", (values - values.round(digits)).abs().max()) < 1e-9:
            return digits
    return most


def _registry_order(row: dict[str, Any], ds: DatasetSpec | None) -> tuple[int, ...]:
    """Position of a series within its dataset, following the order of `select` in the registry.

    This keeps "decile 1 ... decile 10, top 5 per cent" in the publisher's order rather than
    the alphabetical order of the series ids.
    """
    if ds is None or not ds.series_key:
        return ()
    codes = json.loads(row["dims"])
    return tuple(
        ds.select[dim].index(codes[dim]) if codes.get(dim) in ds.select.get(dim, []) else 0
        for dim in ds.series_key
    )


def _years_before(day: date, years: int) -> date:
    try:
        return day.replace(year=day.year - years)
    except ValueError:  # 29 February
        return day.replace(year=day.year - years, day=28)


def _tile(points: pl.DataFrame, tag: str, today: date) -> dict[str, Any]:
    """Latest value, the value a year earlier and a sparkline for one series and entity.

    `points` has period, period_start and value, sorted by time, without nulls. Projections
    (ESTIMATE series that run into the future) are summarised up to the last period.
    """
    latest = points.row(-1, named=True)
    year_before = points.filter(pl.col("period_start") == _years_before(latest["period_start"], 1))
    window = points.filter(
        pl.col("period_start") >= _years_before(latest["period_start"], SPARK_YEARS)
    )
    stride = max(1, -(-window.height // SPARK_POINTS))
    # Sample from the end so the latest point is always part of the sparkline.
    spark = window.reverse().gather_every(stride).reverse()
    return {
        "latest": {"period": latest["period"], "value": latest["value"]},
        "year_before": (
            {"period": year_before["period"][0], "value": year_before["value"][0]}
            if year_before.height
            else None
        ),
        "is_future": tag == "ESTIMATE" and latest["period_start"] > today,
        "spark": {
            "from": spark["period"][0],
            "to": spark["period"][-1],
            "values": spark["value"].to_list(),
        },
    }


def section_titles(sources_md: Path) -> dict[str, str]:
    """Section number -> heading, read from SOURCES.md (for grouping the source board)."""
    if not sources_md.exists():
        return {}
    titles = {}
    for line in sources_md.read_text(encoding="utf-8").splitlines():
        match = _SECTION_HEADING.match(line)
        if match:
            titles[match.group(1)] = match.group(2).strip()
    return titles


def export_site(
    lake: Path,
    registry: Registry,
    out: Path,
    *,
    sources_md: Path = Path("SOURCES.md"),
    now: datetime | None = None,
) -> dict[str, Any]:
    """Write the site's JSON files under `out` and return the build summary."""
    now = now or datetime.now(UTC)
    datasets = {(ds.source_id, ds.dataset): ds for ds in registry.datasets}
    series = storage.read_table(lake, "series")
    observations = storage.read_table(lake, "observations")
    published = sorted(
        series.filter(pl.col("publish")).iter_rows(named=True),
        key=lambda row: (
            row["source_id"],
            row["dataset_id"],
            _registry_order(row, datasets.get((row["source_id"], row["dataset_id"]))),
            row["series_id"],
        ),
    )
    latest_vintage = observations.filter(
        pl.col("vintage") == pl.col("vintage").max().over("series_id", "entity_id", "period")
    )

    catalog: list[dict[str, Any]] = []
    files: dict[str, Any] = {}
    exported_observations = 0
    for row in published:
        rows = latest_vintage.filter(pl.col("series_id") == row["series_id"]).sort(
            "entity_id", "period_start"
        )
        valued = rows.filter(pl.col("value").is_not_null())
        if valued.is_empty():
            continue
        entities: dict[str, dict[str, list[Any]]] = {}
        for entity_id, group in rows.group_by("entity_id", maintain_order=True):
            # Keep gaps inside a series, but not the empty stretch before its first value
            # or after its last one.
            valued_rows = group["value"].is_not_null().arg_true()
            if valued_rows.is_empty():
                continue
            first, last = valued_rows[0], valued_rows[-1]
            kept = group.slice(first, last - first + 1)
            entities[str(entity_id[0])] = {
                "period": kept["period"].to_list(),
                "value": kept["value"].to_list(),
            }
            exported_observations += kept.height
        home = HOME_ENTITY if HOME_ENTITY in entities else next(iter(entities))
        meta = {name: row[name] for name in _SERIES_META}
        ds = datasets.get((row["source_id"], row["dataset_id"]))
        meta["dataset_title_no"] = ds.title_no if ds else None
        meta["terms_note"] = ds.terms_note if ds else None
        meta["decimals"] = _decimals(valued["value"])
        meta["source_updated"] = (
            row["source_updated"].date().isoformat() if row["source_updated"] else None
        )
        meta["retrieved_at"] = row["retrieved_at"].date().isoformat()
        meta["entities"] = list(entities)
        meta["home_entity"] = home
        tile = _tile(
            valued.filter(pl.col("entity_id") == home).select("period", "period_start", "value"),
            row["tag"],
            now.date(),
        )
        catalog.append({**meta, **tile})
        files[f"series/{row['series_id']}.json"] = {"meta": meta, "entities": entities}

    files["catalog.json"] = {"generated_at": now.isoformat(timespec="seconds"), "series": catalog}

    checks = storage.read_source_checks(lake)
    if checks is not None:
        files["sources.json"] = {
            "generated_at": checks["generated_at"],
            "counts": checks["counts"],
            "sections": section_titles(sources_md),
            "results": [
                {name: result.get(name) for name in _SOURCE_FIELDS} for result in checks["results"]
            ],
        }

    report = storage.read_run_report(lake)
    summary = {
        "generated_at": now.isoformat(timespec="seconds"),
        "series": len(catalog),
        "observations": exported_observations,
        "unpublished_series": series.height - len(published),
        "sources": sorted({item["source_id"] for item in catalog}),
        "validation": report["status"] if report else None,
        "source_checks": checks["counts"] if checks else None,
    }
    files["build.json"] = summary

    storage.write_export(out, files)
    return summary
