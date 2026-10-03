"""The site export: what gets published, and the shape of the JSON files."""

import json
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any

import polars as pl
import pytest
from typer.testing import CliRunner

from riksdata import cli, storage
from riksdata.adapters.base import OBSERVATIONS_SCHEMA, Batch
from riksdata.export import _decimals, export_site, section_titles
from riksdata.registry import Registry, load_registry
from support import make_batch, write_registry

NOW = datetime(2026, 10, 3, 12, 0, tzinfo=UTC)

DATASETS = """
- dataset: ds
  title_no: Demodatasett
  topic: demo
  frequency: A
  schedule: daily
  select:
    Kind: [b, a]
    Tid: ["*"]
  series_key: [Kind]
  terms_note: Brukt ikke-kommersielt med kildehenvisning.
"""


@pytest.fixture
def registry(tmp_path: Path) -> Registry:
    return load_registry(write_registry(tmp_path / "registry", {"demo": DATASETS}))


def observations(rows: list[tuple[str, str, str, float | None]]) -> pl.DataFrame:
    """Rows of (series_id, entity_id, year, value)."""
    return pl.DataFrame(
        [
            {
                "series_id": series_id,
                "entity_id": entity,
                "period": year,
                "period_start": date(int(year), 1, 1),
                "value": value,
                "status": None if value is not None else "..",
                "vintage": date(2026, 10, 3),
            }
            for series_id, entity, year, value in rows
        ],
        schema=OBSERVATIONS_SCHEMA,
    )


def build_lake(lake: Path) -> None:
    """Two published series (one with two entities and gaps) and one unpublished series."""
    published = make_batch("demo.ds.a", "demo.ds.b")
    series = published.series.with_columns(
        dims=pl.col("series_id")
        .str.slice(-1)
        .map_elements(lambda kind: json.dumps({"Kind": kind}), return_dtype=pl.String),
        title_no=pl.format("Demodatasett: {}", pl.col("series_id").str.slice(-1)),
    )
    rows = [
        ("demo.ds.a", "NOR", "2021", None),  # leading gap: dropped
        ("demo.ds.a", "NOR", "2022", 10.0),
        ("demo.ds.a", "NOR", "2023", None),  # gap inside the series: kept
        ("demo.ds.a", "NOR", "2024", 11.5),
        ("demo.ds.a", "NOR", "2025", 12.25),
        ("demo.ds.a", "NOR", "2026", None),  # trailing gap: dropped
        ("demo.ds.a", "SWE", "2024", 20.0),
        ("demo.ds.a", "SWE", "2025", 21.0),
        ("demo.ds.b", "NOR", "2025", 1500.0),
    ]
    storage.write_batch(lake, published_dataset(), Batch(series, observations(rows)))
    hidden = make_batch("demo.hidden.x", publish=False)
    storage.write_batch(lake, published_dataset(dataset="hidden"), hidden)


def published_dataset(**overrides: Any) -> Any:
    from support import make_dataset

    return make_dataset(**overrides)


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def test_export_writes_only_published_series(tmp_path: Path, registry: Registry) -> None:
    lake, out = tmp_path / "lake", tmp_path / "beta" / "data"
    build_lake(lake)

    summary = export_site(lake, registry, out, now=NOW)

    assert summary == {
        "generated_at": "2026-10-03T12:00:00+00:00",
        "series": 2,
        "observations": 7,
        "unpublished_series": 1,
        "sources": ["demo"],
        "validation": None,
        "source_checks": None,
    }
    assert read(out / "build.json") == summary
    assert sorted(path.name for path in (out / "series").iterdir()) == [
        "demo.ds.a.json",
        "demo.ds.b.json",
    ]
    assert not (out / "sources.json").exists()
    # Nothing about the unpublished series reaches the export.
    assert "hidden" not in (out / "catalog.json").read_text(encoding="utf-8")


def test_series_file_keeps_inner_gaps_and_trims_the_ends(
    tmp_path: Path, registry: Registry
) -> None:
    lake, out = tmp_path / "lake", tmp_path / "out"
    build_lake(lake)
    export_site(lake, registry, out, now=NOW)

    series = read(out / "series" / "demo.ds.a.json")

    assert series["entities"] == {
        "NOR": {"period": ["2022", "2023", "2024", "2025"], "value": [10.0, None, 11.5, 12.25]},
        "SWE": {"period": ["2024", "2025"], "value": [20.0, 21.0]},
    }
    assert series["meta"]["entities"] == ["NOR", "SWE"]
    assert series["meta"]["home_entity"] == "NOR"
    assert series["meta"]["dataset_title_no"] == "Demodatasett"
    assert series["meta"]["retrieved_at"] == "2026-10-03"
    assert series["meta"]["terms_note"] == "Brukt ikke-kommersielt med kildehenvisning."
    catalog = read(out / "catalog.json")
    assert {item["terms_note"] for item in catalog["series"]} == {series["meta"]["terms_note"]}


def test_catalog_has_tiles_in_registry_order(tmp_path: Path, registry: Registry) -> None:
    lake, out = tmp_path / "lake", tmp_path / "out"
    build_lake(lake)
    export_site(lake, registry, out, now=NOW)

    catalog = read(out / "catalog.json")

    # The registry lists Kind as [b, a], so b comes first although a sorts first by id.
    assert [item["series_id"] for item in catalog["series"]] == ["demo.ds.b", "demo.ds.a"]
    tile = catalog["series"][1]
    assert tile["latest"] == {"period": "2025", "value": 12.25}
    assert tile["year_before"] == {"period": "2024", "value": 11.5}
    assert tile["spark"] == {"from": "2022", "to": "2025", "values": [10.0, 11.5, 12.25]}
    assert tile["decimals"] == 2
    assert tile["is_future"] is False
    assert catalog["series"][0]["year_before"] is None
    assert catalog["series"][0]["decimals"] == 0


def test_unpublishing_a_series_removes_its_file(tmp_path: Path, registry: Registry) -> None:
    lake, out = tmp_path / "lake", tmp_path / "out"
    build_lake(lake)
    export_site(lake, registry, out, now=NOW)
    assert (out / "series" / "demo.ds.b.json").exists()

    series = storage.read_table(lake, "series").filter(pl.col("dataset_id") == "ds")
    withdrawn = series.with_columns(publish=pl.col("series_id") != "demo.ds.b")
    values = storage.read_table(lake, "observations").filter(
        pl.col("series_id").str.starts_with("demo.ds.")
    )
    storage.write_batch(lake, published_dataset(), Batch(withdrawn, values))
    summary = export_site(lake, registry, out, now=NOW)

    assert summary["series"] == 1
    assert not (out / "series" / "demo.ds.b.json").exists()


def test_sources_and_validation_are_included_when_present(
    tmp_path: Path, registry: Registry
) -> None:
    lake, out = tmp_path / "lake", tmp_path / "out"
    build_lake(lake)
    storage.write_run_report(lake, {"status": "warn"})
    storage.write_source_checks(
        lake,
        {
            "generated_at": "2026-10-03T12:00:00+00:00",
            "counts": {"ok": 1},
            "results": [
                {
                    "id": "demo",
                    "section": "2",
                    "name": "Demo",
                    "priority": "A",
                    "status": "ok",
                    "detail": "expected content found",
                    "http_status": 200,
                    "content_type": "application/json",
                    "bytes": 12,
                    "seconds": 0.1,
                    "checked_at": "2026-10-03T12:00:00+00:00",
                }
            ],
        },
    )
    sources_md = tmp_path / "SOURCES.md"
    sources_md.write_text("# x\n\n## 2. Public finance\n\n### 4a. Parliament\n", encoding="utf-8")

    summary = export_site(lake, registry, out, sources_md=sources_md, now=NOW)

    sources = read(out / "sources.json")
    assert summary["validation"] == "warn"
    assert summary["source_checks"] == {"ok": 1}
    assert sources["sections"] == {"2": "Public finance", "4a": "Parliament"}
    assert sources["results"] == [
        {
            "id": "demo",
            "section": "2",
            "name": "Demo",
            "priority": "A",
            "status": "ok",
            "detail": "expected content found",
            "http_status": 200,
            "checked_at": "2026-10-03T12:00:00+00:00",
        }
    ]


@pytest.mark.parametrize(
    ("values", "decimals"),
    [
        ([1.0, 2.0, 3.0], 0),
        ([4.0, 6.2, 51.9], 1),
        ([83.3078, 82.63], 2),
        ([103.5, 100.9], 1),
        ([161.25, 157.3], 1),  # three-digit numbers show at most one decimal
        ([95173.43, 88366.0], 0),  # large numbers show none
    ],
)
def test_decimals(values: list[float], decimals: int) -> None:
    assert _decimals(pl.Series(values)) == decimals


def test_section_titles_without_a_catalogue(tmp_path: Path) -> None:
    assert section_titles(tmp_path / "missing.md") == {}


def test_cli_export(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    write_registry(tmp_path / "registry", {"demo": DATASETS})
    build_lake(tmp_path / "lake")
    monkeypatch.chdir(tmp_path)

    result = CliRunner().invoke(cli.app, ["export"])

    assert result.exit_code == 0, result.output
    assert "Exported 2 series (7 observations) from demo to beta/data" in result.output
    assert "1 unpublished series were left out" in result.output
    assert Path("beta/data/catalog.json").exists()
