"""Storage: raw archive, Parquet tables, DuckDB views and the state file."""

import json
from datetime import UTC, date, datetime, timedelta, timezone
from pathlib import Path

import polars as pl
import pytest

from riksdata import storage
from riksdata.adapters.base import OBSERVATIONS_SCHEMA, SERIES_SCHEMA, Batch, RawArtifact
from support import make_batch, make_dataset, make_source


def make_raw(content: bytes = b'{"value": [1]}', **overrides: object) -> RawArtifact:
    fields = {
        "url": "https://example.org/api/ds",
        "fetched_at": datetime(2026, 10, 3, 9, 0, tzinfo=UTC),
        "content_type": "application/json; charset=utf-8",
        "content": content,
        "meta": {"labels_en": {"a": "Series A"}},
    }
    return RawArtifact(**{**fields, **overrides})


def test_round_trip_parquet_to_duckdb(tmp_path: Path) -> None:
    first = make_dataset(dataset="first")
    second = make_dataset(source_id="other", dataset="second")
    storage.write_batch(tmp_path, first, make_batch("demo.first.a", "demo.first.b"))
    storage.write_batch(tmp_path, second, make_batch("other.second.x", periods=("2026-08",)))
    storage.write_sources(tmp_path, [make_source(), make_source(source_id="other")])

    storage.build_duckdb(tmp_path)

    connection = storage.connect(tmp_path)
    try:
        counts = connection.sql(
            "SELECT s.source_id, count(*) FROM observations o JOIN series s USING (series_id) "
            "GROUP BY 1 ORDER BY 1"
        ).fetchall()
        value = connection.sql(
            "SELECT value FROM observations_latest "
            "WHERE series_id = 'demo.first.b' AND period = '2025'"
        ).fetchone()
        sources = connection.sql(
            "SELECT source_id, rate_limit_calls, redistribution, terms_checked "
            "FROM sources ORDER BY 1"
        ).fetchall()
        series_columns = connection.sql("SELECT * FROM series").columns
        observation_columns = connection.sql("SELECT * FROM observations").columns
    finally:
        connection.close()

    assert counts == [("demo", 4), ("other", 1)]
    assert value == (2.0,)
    assert sources == [
        ("demo", 1000, "attribution", date(2026, 10, 3)),
        ("other", 1000, "attribution", date(2026, 10, 3)),
    ]
    # The views expose exactly the PLAN.md columns, without a hive `source` column.
    assert series_columns == list(SERIES_SCHEMA)
    assert observation_columns == list(OBSERVATIONS_SCHEMA)


def test_observations_latest_keeps_the_newest_vintage(tmp_path: Path) -> None:
    old = make_batch(vintage=date(2026, 9, 1))
    new = make_batch(vintage=date(2026, 10, 3))
    revised = new.observations.with_columns(pl.col("value") + 100)
    both = Batch(new.series, pl.concat([old.observations, revised]))
    storage.write_batch(tmp_path, make_dataset(), both)
    storage.build_duckdb(tmp_path)

    connection = storage.connect(tmp_path)
    try:
        everything = connection.sql("SELECT count(*) FROM observations").fetchone()
        latest = connection.sql(
            "SELECT period, value, vintage FROM observations_latest ORDER BY period"
        ).fetchall()
    finally:
        connection.close()

    assert everything == (4,)
    assert latest == [("2024", 101.0, date(2026, 10, 3)), ("2025", 102.0, date(2026, 10, 3))]


def test_write_batch_replaces_the_previous_version(tmp_path: Path) -> None:
    ds = make_dataset()
    storage.write_batch(tmp_path, ds, make_batch("demo.ds.a", "demo.ds.b"))
    storage.write_batch(tmp_path, ds, make_batch("demo.ds.a", periods=("2023", "2024", "2025")))

    assert storage.batch_counts(tmp_path, ds) == (1, 3)
    assert storage.read_table(tmp_path, "series")["series_id"].to_list() == ["demo.ds.a"]
    assert storage.batch_counts(tmp_path, make_dataset(dataset="missing")) is None


def test_read_table_on_an_empty_lake(tmp_path: Path) -> None:
    series = storage.read_table(tmp_path, "series")

    assert series.is_empty()
    assert dict(series.schema) == SERIES_SCHEMA


def test_build_duckdb_on_an_empty_lake(tmp_path: Path) -> None:
    storage.build_duckdb(tmp_path)

    connection = storage.connect(tmp_path)
    try:
        views = connection.sql("SELECT view_name FROM duckdb_views() WHERE NOT internal").fetchall()
    finally:
        connection.close()

    assert views == []


def test_connect_before_any_update(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError, match="run `riksdata update` first"):
        storage.connect(tmp_path)


def test_archive_raw_never_overwrites_within_a_day(tmp_path: Path) -> None:
    ds = make_dataset()

    first = storage.archive_raw(tmp_path, ds, make_raw(b"first"))
    second = storage.archive_raw(tmp_path, ds, make_raw(b"second"))
    third = storage.archive_raw(tmp_path, ds, make_raw(b"third"))

    folder = tmp_path / "raw" / "demo" / "2026-10-03"
    assert [first, second, third] == [
        folder / "ds.json",
        folder / "ds.2.json",
        folder / "ds.3.json",
    ]
    assert [path.read_bytes() for path in (first, second, third)] == [b"first", b"second", b"third"]
    sidecar = json.loads((folder / "ds.2.meta.json").read_text(encoding="utf-8"))
    assert sidecar == {
        "url": "https://example.org/api/ds",
        "fetched_at": "2026-10-03T09:00:00+00:00",
        "content_type": "application/json; charset=utf-8",
        "meta": {"labels_en": {"a": "Series A"}},
    }


def test_archive_raw_uses_the_utc_date_and_content_type(tmp_path: Path) -> None:
    oslo = timezone(timedelta(hours=2))
    just_after_midnight = datetime(2026, 10, 4, 0, 30, tzinfo=oslo)  # still 3 October in UTC

    csv = storage.archive_raw(
        tmp_path,
        make_dataset(),
        make_raw(b"a,b\n", fetched_at=just_after_midnight, content_type="text/csv"),
    )
    unknown = storage.archive_raw(
        tmp_path, make_dataset(dataset="blob"), make_raw(content_type="application/x-thing")
    )

    assert csv == tmp_path / "raw" / "demo" / "2026-10-03" / "ds.csv"
    assert unknown.name == "blob.bin"


def test_state_round_trip(tmp_path: Path) -> None:
    assert storage.load_state(tmp_path) == {}

    state = {"demo/ds": {"source_updated": "2026-09-10T06:00:00+00:00", "last_success": "x"}}
    storage.save_state(tmp_path, state)

    assert storage.load_state(tmp_path) == state


def test_run_report_and_catalog_round_trip(tmp_path: Path) -> None:
    assert storage.read_run_report(tmp_path) is None
    assert storage.read_catalog(tmp_path, "ssb_tables") is None

    storage.write_run_report(tmp_path, {"status": "pass", "note": "blåbær"})
    storage.write_catalog(tmp_path, "ssb_tables", pl.DataFrame({"id": ["14710"]}))

    assert storage.read_run_report(tmp_path) == {"status": "pass", "note": "blåbær"}
    assert storage.read_catalog(tmp_path, "ssb_tables")["id"].to_list() == ["14710"]
    assert not list(tmp_path.rglob("*.tmp"))
