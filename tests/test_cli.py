"""The update loop and the CLI commands, driven by a fake adapter (no network)."""

import re
from datetime import UTC, datetime
from pathlib import Path

import polars as pl
import pytest
from typer.testing import CliRunner

from riksdata import cli, storage
from riksdata.adapters.base import Batch, RawArtifact
from riksdata.registry import DatasetSpec, Registry, load_registry
from support import RETRIEVED_AT, make_batch, write_registry

DATASETS = """
- dataset: first
  title_no: Første
  topic: demo
  frequency: A
  schedule: daily
- dataset: second
  slug: two
  title_no: Andre
  topic: demo
  frequency: A
  schedule: daily
"""


class FakeAdapter:
    source_id = "demo"

    def __init__(self) -> None:
        self.updated: datetime | None = datetime(2026, 9, 10, 6, 0, tzinfo=UTC)
        self.fetched: list[str] = []
        self.broken: set[str] = set()
        self.bad_schema = False

    def catalog(self, *, include_discontinued: bool = False) -> pl.DataFrame | None:
        tables = [
            {
                "id": "12439",
                "label_no": "Sykefravær for lønnstakere",
                "label_en": "Sickness absence",
            },
            {"id": "14710", "label_no": "Konsumprisindeks", "label_en": "Consumer price index"},
        ]
        if include_discontinued:
            tables.append(
                {"id": "03013", "label_no": "Konsumprisindeks (avsluttet)", "label_en": ""}
            )
        return pl.DataFrame(tables).with_columns(last_period=pl.lit("2026M08"))

    def remote_updated(self, ds: DatasetSpec) -> datetime | None:
        return self.updated

    def fetch(self, ds: DatasetSpec) -> RawArtifact:
        self.fetched.append(ds.dataset)
        if ds.dataset in self.broken:
            raise RuntimeError("publisher is down")
        return RawArtifact("https://example.org/x", RETRIEVED_AT, "application/json", b"{}")

    def normalize(self, raw: RawArtifact, ds: DatasetSpec) -> Batch:
        batch = make_batch(f"demo.{ds.dataset}.a", f"demo.{ds.dataset}.b")
        if self.bad_schema:
            return Batch(batch.series.drop("unit"), batch.observations)
        return batch


@pytest.fixture
def registry(tmp_path: Path) -> Registry:
    return load_registry(write_registry(tmp_path / "registry", {"demo": DATASETS}))


@pytest.fixture
def lake(tmp_path: Path) -> Path:
    return tmp_path / "lake"


def statuses(results: list[cli.UpdateResult]) -> dict[str, str]:
    return {result.dataset: result.status for result in results}


def test_update_writes_the_lake(registry: Registry, lake: Path) -> None:
    adapter = FakeAdapter()

    results = cli.run_update(registry, {"demo": adapter}, lake)

    assert statuses(results) == {"demo/first": "updated", "demo/second": "updated"}
    assert [(r.series, r.observations) for r in results] == [(2, 4), (2, 4)]
    assert (lake / "raw" / "demo" / "2026-10-03" / "first.json").read_bytes() == b"{}"
    assert storage.read_table(lake, "observations").height == 8
    assert storage.load_state(lake)["demo/first"]["source_updated"] == "2026-09-10T06:00:00+00:00"
    connection = storage.connect(lake)
    try:
        assert connection.sql("SELECT count(*) FROM series").fetchone() == (4,)
        assert connection.sql("SELECT source_id FROM sources").fetchall() == [("demo",)]
    finally:
        connection.close()


def test_update_skips_unchanged_datasets_unless_forced(registry: Registry, lake: Path) -> None:
    adapter = FakeAdapter()
    cli.run_update(registry, {"demo": adapter}, lake)

    unchanged = cli.run_update(registry, {"demo": adapter}, lake)
    forced = cli.run_update(registry, {"demo": adapter}, lake, force=True)

    assert statuses(unchanged) == {"demo/first": "unchanged", "demo/second": "unchanged"}
    assert [(r.series, r.observations) for r in unchanged] == [(2, 4), (2, 4)]
    assert statuses(forced) == {"demo/first": "updated", "demo/second": "updated"}
    assert adapter.fetched == ["first", "second", "first", "second"]
    # The forced refetch is archived next to the first one, not over it.
    assert (lake / "raw" / "demo" / "2026-10-03" / "first.2.json").exists()


def test_update_refetches_when_the_publisher_reports_a_change(
    registry: Registry, lake: Path
) -> None:
    adapter = FakeAdapter()
    cli.run_update(registry, {"demo": adapter}, lake)

    adapter.updated = datetime(2026, 10, 1, 6, 0, tzinfo=UTC)
    changed = cli.run_update(registry, {"demo": adapter}, lake)
    adapter.updated = None  # a source without a staleness probe is always fetched
    unknown = cli.run_update(registry, {"demo": adapter}, lake)

    assert set(statuses(changed).values()) == {"updated"}
    assert set(statuses(unknown).values()) == {"updated"}


def test_update_refetches_when_the_registry_entry_changes(registry: Registry, lake: Path) -> None:
    adapter = FakeAdapter()
    cli.run_update(registry, {"demo": adapter}, lake)
    first, second = registry.datasets
    edited = Registry(
        sources=registry.sources,
        datasets=[first.model_copy(update={"entities": ["NOR", "SWE"]}), second],
    )

    results = cli.run_update(edited, {"demo": adapter}, lake)

    # Same data at the publisher, but the selection changed, so it must not be skipped.
    assert statuses(results) == {"demo/first": "updated", "demo/second": "unchanged"}


def test_update_filters_by_source_dataset_and_slug(registry: Registry, lake: Path) -> None:
    adapter = FakeAdapter()

    by_slug = cli.run_update(registry, {"demo": adapter}, lake, dataset="two")
    other_source = cli.run_update(registry, {"demo": adapter}, lake, source="other")

    assert statuses(by_slug) == {"demo/second": "updated"}
    assert other_source == []


def test_a_failing_dataset_does_not_stop_the_others(registry: Registry, lake: Path) -> None:
    adapter = FakeAdapter()
    adapter.broken = {"first"}

    results = cli.run_update(registry, {"demo": adapter}, lake)

    assert statuses(results) == {"demo/first": "failed", "demo/second": "updated"}
    assert results[0].error == "publisher is down"
    assert "demo/first" not in storage.load_state(lake)
    assert storage.read_table(lake, "series")["dataset_id"].unique().to_list() == ["second"]


def test_a_batch_with_the_wrong_schema_is_not_written(registry: Registry, lake: Path) -> None:
    adapter = FakeAdapter()
    adapter.bad_schema = True

    results = cli.run_update(registry, {"demo": adapter}, lake)

    assert set(statuses(results).values()) == {"failed"}
    assert "series: missing column 'unit'" in (results[0].error or "")
    assert storage.table_files(lake, "series") == []


def test_dataset_without_an_adapter_fails_clearly(registry: Registry, lake: Path) -> None:
    results = cli.run_update(registry, {}, lake)

    assert results[0].status == "failed"
    assert results[0].error == "no adapter for source 'demo'"


@pytest.fixture
def workdir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> FakeAdapter:
    """Run the CLI from a temporary directory with a registry and the fake adapter."""
    write_registry(tmp_path / "registry", {"demo": DATASETS})
    monkeypatch.chdir(tmp_path)
    adapter = FakeAdapter()
    monkeypatch.setattr(cli, "build_adapter", lambda source, client: adapter)
    return adapter


def test_cli_update_validate_and_sql(workdir: FakeAdapter) -> None:
    runner = CliRunner()

    update = runner.invoke(cli.app, ["update"])
    validate = runner.invoke(cli.app, ["validate"])
    sql = runner.invoke(
        cli.app, ["sql", "select series_id, count(*) n from observations group by 1 order by 1"]
    )

    assert update.exit_code == 0, update.output
    assert "demo/first" in update.output and "updated" in update.output
    assert re.search(r"^total\s+4\s+8\b", update.output, flags=re.MULTILINE)
    assert validate.exit_code == 0, validate.output
    assert "Validation: pass" in validate.output
    assert Path("lake/run_report.json").exists()
    assert sql.exit_code == 0, sql.output
    assert "demo.second.b" in sql.output


def test_cli_update_warns_while_the_contact_address_is_the_placeholder(
    workdir: FakeAdapter, monkeypatch: pytest.MonkeyPatch
) -> None:
    runner = CliRunner()

    monkeypatch.delenv("RIKSDATA_CONTACT_EMAIL", raising=False)
    placeholder = runner.invoke(cli.app, ["update"])
    monkeypatch.setenv("RIKSDATA_CONTACT_EMAIL", "egil@example.org")
    real = runner.invoke(cli.app, ["update", "--force"])

    assert "RIKSDATA_CONTACT_EMAIL is not set" in placeholder.output
    assert "kontakt@riksdata.org" in placeholder.output
    assert real.exit_code == 0, real.output
    assert "RIKSDATA_CONTACT_EMAIL" not in real.output


def test_cli_update_exits_non_zero_when_a_dataset_fails(workdir: FakeAdapter) -> None:
    workdir.broken = {"second"}

    result = CliRunner().invoke(cli.app, ["update"])

    assert result.exit_code == 1
    assert "failed" in result.output
    assert "demo/second failed: publisher is down" in result.output


def test_cli_update_with_no_matching_dataset(workdir: FakeAdapter) -> None:
    result = CliRunner().invoke(cli.app, ["update", "--source", "nope"])

    assert result.exit_code == 1
    assert "No datasets in the registry match" in result.output


def test_cli_validate_fails_on_an_empty_lake(workdir: FakeAdapter) -> None:
    result = CliRunner().invoke(cli.app, ["validate"])

    assert result.exit_code == 1
    assert "FAIL  schema" in result.output


def test_cli_sql_errors(workdir: FakeAdapter) -> None:
    runner = CliRunner()

    before_update = runner.invoke(cli.app, ["sql", "select 1"])
    runner.invoke(cli.app, ["update"])
    bad_query = runner.invoke(cli.app, ["sql", "select * from no_such_table"])

    assert before_update.exit_code == 1
    assert "run `riksdata update` first" in before_update.output
    assert bad_query.exit_code == 1
    assert "SQL error" in bad_query.output


def test_cli_catalog_refresh_and_search(workdir: FakeAdapter) -> None:
    runner = CliRunner()

    too_early = runner.invoke(cli.app, ["catalog", "demo", "--search", "kpi"])
    refresh = runner.invoke(cli.app, ["catalog", "demo", "--refresh"])
    search = runner.invoke(cli.app, ["catalog", "demo", "--search", "SYKEFRAVÆR"])
    english = runner.invoke(cli.app, ["catalog", "demo", "--search", "price"])
    everything = runner.invoke(cli.app, ["catalog", "demo", "--refresh", "--include-discontinued"])

    assert too_early.exit_code == 1
    assert "riksdata catalog demo --refresh" in too_early.output
    assert "Saved 2 tables" in refresh.output
    assert "12439" in search.output and "1 of 2 tables match" in search.output
    assert "14710" in english.output and "12439" not in english.output
    assert "Saved 3 tables" in everything.output


def test_cli_reports_registry_errors(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.chdir(tmp_path)

    result = CliRunner().invoke(cli.app, ["update"])

    assert result.exit_code == 2
    assert "Registry error" in result.output
