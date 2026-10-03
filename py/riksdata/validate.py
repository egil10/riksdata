"""Data-quality checks over the lake. `riksdata validate` runs them and writes the run report."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any, Literal

import polars as pl

from riksdata import storage
from riksdata.adapters.base import (
    ESTIMATE_BY,
    OBSERVATIONS_SCHEMA,
    SERIES_SCHEMA,
    TAGS,
    schema_problems,
)
from riksdata.periods import parse_period

Status = Literal["pass", "warn", "fail"]

MAX_EXAMPLES = 10
MAX_ROW_DROP = 0.20
# Days allowed between the start of a series' latest period and today, by frequency.
# Warnings only for now; per-source limits come with the scheduled workflow (Phase 1c).
MAX_AGE_DAYS = {"D": 14, "W": 35, "M": 100, "Q": 280, "A": 1100}

_REQUIRED_TEXT = ("unit", "licence", "source_url", "tag")
_OBSERVATION_KEY = ["series_id", "entity_id", "period", "vintage"]


@dataclass
class Check:
    name: str
    status: Status
    detail: str
    examples: list[str] = field(default_factory=list)


def _result(name: str, problems: list[str], *, ok: str, bad: str, severity: Status) -> Check:
    if not problems:
        return Check(name, "pass", ok)
    return Check(name, severity, f"{len(problems)} {bad}", problems[:MAX_EXAMPLES])


def _check_schema(lake: Path) -> Check:
    problems: list[str] = []
    files = 0
    for table, expected in (("series", SERIES_SCHEMA), ("observations", OBSERVATIONS_SCHEMA)):
        for path in storage.table_files(lake, table):
            files += 1
            name = str(path.relative_to(lake))
            problems += schema_problems(storage.read_schema(path), expected, name)
    if not files:
        return Check("schema", "fail", "the lake has no Parquet files; run `riksdata update` first")
    return _result(
        "schema",
        problems,
        ok=f"{files} Parquet files match the PLAN.md schemas",
        bad="schema differences",
        severity="fail",
    )


def _check_unique_observations(observations: pl.DataFrame) -> Check:
    duplicates = observations.group_by(_OBSERVATION_KEY).len().filter(pl.col("len") > 1)
    problems = [
        f"{row['series_id']} {row['entity_id']} {row['period']} {row['vintage']} ({row['len']}x)"
        for row in duplicates.sort(_OBSERVATION_KEY).iter_rows(named=True)
    ]
    return _result(
        "unique_observations",
        problems,
        ok="(series_id, entity_id, period, vintage) is unique",
        bad="duplicated observation keys",
        severity="fail",
    )


def _check_required_fields(series: pl.DataFrame) -> Check:
    problems: list[str] = []
    for row in series.iter_rows(named=True):
        faults = [column for column in _REQUIRED_TEXT if not (row[column] or "").strip()]
        faults += [column for column in ("retrieved_at", "publish") if row[column] is None]
        tag, estimate_by = row["tag"], row["estimate_by"]
        if tag and tag not in TAGS:
            faults.append(f"tag={tag!r} is not one of {'|'.join(TAGS)}")
        if tag == "ESTIMATE" and estimate_by not in ESTIMATE_BY:
            faults.append(f"estimate_by must be {' or '.join(ESTIMATE_BY)} for an ESTIMATE")
        if tag != "ESTIMATE" and estimate_by is not None:
            faults.append("estimate_by is only for ESTIMATE series")
        if faults:
            problems.append(f"{row['series_id']}: {', '.join(faults)}")
    return _result(
        "required_series_fields",
        problems,
        ok="every series has unit, licence, source_url, retrieved_at, publish and a valid tag",
        bad="series with missing or invalid fields",
        severity="fail",
    )


def _check_no_empty_series(series: pl.DataFrame, observations: pl.DataFrame) -> Check:
    with_values = observations.filter(pl.col("value").is_not_null()).select("series_id").unique()
    empty = series.join(with_values, on="series_id", how="anti")
    return _result(
        "no_all_null_series",
        empty["series_id"].sort().to_list(),
        ok="every series has at least one value",
        bad="series without a single value",
        severity="fail",
    )


def _check_freshness(series: pl.DataFrame, today: date) -> Check:
    problems: list[str] = []
    for row in series.sort("series_id").iter_rows(named=True):
        limit = MAX_AGE_DAYS.get(row["frequency"])
        if limit is None or row["last_period"] is None:
            continue
        age = (today - parse_period(row["last_period"]).period_start).days
        if age > limit:
            problems.append(
                f"{row['series_id']}: latest period {row['last_period']} is {age} days old "
                f"(limit {limit} for frequency {row['frequency']})"
            )
    return _result(
        "freshness",
        problems,
        ok="every series has a recent latest period for its frequency",
        bad="series look stale",
        severity="warn",
    )


def _check_row_drop(datasets: dict[str, dict[str, int]], previous: dict[str, Any] | None) -> Check:
    if previous is None:
        return Check("row_count_drop", "pass", "no previous run report to compare with")
    problems: list[str] = []
    for key, before in sorted(previous.get("datasets", {}).items()):
        rows_before = before.get("observations", 0)
        rows_now = datasets.get(key, {}).get("observations", 0)
        if rows_before and rows_now < rows_before * (1 - MAX_ROW_DROP):
            problems.append(f"{key}: {rows_before} -> {rows_now} observations")
    return _result(
        "row_count_drop",
        problems,
        ok=f"no dataset lost more than {MAX_ROW_DROP:.0%} of its observations",
        bad=f"datasets lost more than {MAX_ROW_DROP:.0%} of their observations",
        severity="warn",
    )


def _dataset_counts(series: pl.DataFrame, observations: pl.DataFrame) -> dict[str, dict[str, int]]:
    per_series = observations.group_by("series_id").agg(pl.len().alias("observations"))
    grouped = (
        series.join(per_series, on="series_id", how="left")
        .group_by("source_id", "dataset_id")
        .agg(pl.len().alias("series"), pl.col("observations").sum())
        .sort("source_id", "dataset_id")
    )
    return {
        f"{row['source_id']}/{row['dataset_id']}": {
            "series": row["series"],
            "observations": row["observations"] or 0,
        }
        for row in grouped.iter_rows(named=True)
    }


def _source_counts(datasets: dict[str, dict[str, int]]) -> dict[str, dict[str, int]]:
    sources: dict[str, dict[str, int]] = {}
    for key, counts in datasets.items():
        totals = sources.setdefault(
            key.split("/")[0], {"datasets": 0, "series": 0, "observations": 0}
        )
        totals["datasets"] += 1
        totals["series"] += counts["series"]
        totals["observations"] += counts["observations"]
    return sources


def run(lake: Path, now: datetime | None = None) -> dict[str, Any]:
    """Run every check, write `run_report.json` and return the report.

    The report's `status` is `fail` if any check failed, else `warn` or `pass`.
    """
    now = now or datetime.now(UTC)
    previous = storage.read_run_report(lake)
    checks = [_check_schema(lake)]
    datasets: dict[str, dict[str, int]] = {}
    if checks[0].status == "pass":
        series = storage.read_table(lake, "series")
        observations = storage.read_table(lake, "observations")
        datasets = _dataset_counts(series, observations)
        checks += [
            _check_unique_observations(observations),
            _check_required_fields(series),
            _check_no_empty_series(series, observations),
            _check_freshness(series, now.date()),
            _check_row_drop(datasets, previous),
        ]
    statuses = {check.status for check in checks}
    report = {
        "generated_at": now.isoformat(),
        "status": "fail" if "fail" in statuses else "warn" if "warn" in statuses else "pass",
        "sources": _source_counts(datasets),
        "datasets": datasets,
        "checks": [asdict(check) for check in checks],
    }
    storage.write_run_report(lake, report)
    return report
