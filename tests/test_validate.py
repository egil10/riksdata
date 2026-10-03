"""Validation checks and the run report."""

from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import polars as pl
import pytest

from riksdata import storage, validate
from riksdata.adapters.base import Batch
from support import make_batch, make_dataset

NOW = datetime(2026, 10, 3, 12, 0, tzinfo=UTC)


def run(lake: Path, batch: Batch | None = None) -> dict[str, Any]:
    if batch is not None:
        storage.write_batch(lake, make_dataset(), batch)
    return validate.run(lake, now=NOW)


def check(report: dict[str, Any], name: str) -> dict[str, Any]:
    return next(item for item in report["checks"] if item["name"] == name)


def test_clean_lake_passes_and_writes_the_report(tmp_path: Path) -> None:
    report = run(tmp_path, make_batch("demo.ds.a", "demo.ds.b"))

    assert report["status"] == "pass"
    assert [item["status"] for item in report["checks"]] == ["pass"] * 6
    assert report["datasets"] == {"demo/ds": {"series": 2, "observations": 4}}
    assert report["sources"] == {"demo": {"datasets": 1, "series": 2, "observations": 4}}
    assert report["generated_at"] == "2026-10-03T12:00:00+00:00"
    assert storage.read_run_report(tmp_path) == report


def test_empty_lake_fails(tmp_path: Path) -> None:
    report = run(tmp_path)

    assert report["status"] == "fail"
    assert "run `riksdata update` first" in check(report, "schema")["detail"]


def test_duplicate_observation_key_fails(tmp_path: Path) -> None:
    batch = make_batch()
    doubled = Batch(batch.series, pl.concat([batch.observations, batch.observations.head(1)]))

    report = run(tmp_path, doubled)

    result = check(report, "unique_observations")
    assert report["status"] == "fail"
    assert result["status"] == "fail"
    assert result["examples"] == ["demo.ds.a NOR 2024 2026-10-03 (2x)"]


def test_missing_unit_fails(tmp_path: Path) -> None:
    report = run(tmp_path, make_batch("demo.ds.a", "demo.ds.b", unit=None))

    result = check(report, "required_series_fields")
    assert report["status"] == "fail"
    assert result["detail"] == "2 series with missing or invalid fields"
    assert result["examples"] == ["demo.ds.a: unit", "demo.ds.b: unit"]


@pytest.mark.parametrize(
    ("overrides", "fault"),
    [
        ({"unit": "  "}, "unit"),
        ({"licence": None}, "licence"),
        ({"source_url": ""}, "source_url"),
        ({"retrieved_at": None}, "retrieved_at"),
        ({"publish": None}, "publish"),
        ({"tag": None}, "tag"),
        ({"tag": "MODEL"}, "tag='MODEL' is not one of DATA|LAW|ESTIMATE|PROPOSAL"),
        ({"tag": "ESTIMATE"}, "estimate_by must be publisher or riksdata for an ESTIMATE"),
        ({"estimate_by": "riksdata"}, "estimate_by is only for ESTIMATE series"),
    ],
)
def test_required_series_fields(tmp_path: Path, overrides: dict[str, Any], fault: str) -> None:
    report = run(tmp_path, make_batch(**overrides))

    result = check(report, "required_series_fields")
    assert result["status"] == "fail"
    assert result["examples"] == [f"demo.ds.a: {fault}"]


def test_estimate_with_an_estimator_passes(tmp_path: Path) -> None:
    report = run(tmp_path, make_batch(tag="ESTIMATE", estimate_by="publisher"))

    assert check(report, "required_series_fields")["status"] == "pass"


def test_series_without_values_fail(tmp_path: Path) -> None:
    batch = make_batch("demo.ds.a", "demo.ds.b", "demo.ds.c")
    observations = batch.observations.filter(pl.col("series_id") != "demo.ds.c").with_columns(
        pl.when(pl.col("series_id") == "demo.ds.b").then(None).otherwise("value").alias("value")
    )

    report = run(tmp_path, Batch(batch.series, observations))

    result = check(report, "no_all_null_series")
    assert result["status"] == "fail"
    assert result["examples"] == ["demo.ds.b", "demo.ds.c"]


def test_schema_mismatch_fails_and_skips_the_other_checks(tmp_path: Path) -> None:
    batch = make_batch()
    wrong = Batch(batch.series, batch.observations.with_columns(pl.col("value").cast(pl.Int64)))

    report = run(tmp_path, wrong)

    assert report["status"] == "fail"
    assert [item["name"] for item in report["checks"]] == ["schema"]
    assert check(report, "schema")["examples"] == [
        "parquet/observations/source=demo/ds.parquet: column 'value' is Int64, expected Float64"
    ]


@pytest.mark.parametrize(
    ("periods", "status"),
    [
        (("2023", "2024"), "pass"),  # 2024-01-01 is 1006 days before NOW
        (("2022", "2023"), "warn"),
        (("2026-06", "2026-07"), "pass"),
        (("2026-05", "2026-06"), "warn"),  # 2026-06-01 is 124 days before NOW
        (("2026-Q1",), "pass"),
        (("2025-Q4",), "warn"),
        (("2099", "2100"), "pass"),  # projections are never stale
    ],
)
def test_freshness_warns_but_does_not_fail(
    tmp_path: Path, periods: tuple[str, ...], status: str
) -> None:
    report = run(tmp_path, make_batch(periods=periods))

    assert check(report, "freshness")["status"] == status
    assert report["status"] == status


def test_row_count_drop_warns(tmp_path: Path) -> None:
    five = ("2021", "2022", "2023", "2024", "2025")

    first = run(tmp_path, make_batch(periods=five))
    small_drop = run(tmp_path, make_batch(periods=five[1:]))  # 5 -> 4 is exactly 20%
    big_drop = run(tmp_path, make_batch(periods=five[3:]))  # 4 -> 2

    assert check(first, "row_count_drop")["detail"] == "no previous run report to compare with"
    assert check(small_drop, "row_count_drop")["status"] == "pass"
    result = check(big_drop, "row_count_drop")
    assert result["status"] == "warn"
    assert result["examples"] == ["demo/ds: 4 -> 2 observations"]
    assert big_drop["status"] == "warn"
