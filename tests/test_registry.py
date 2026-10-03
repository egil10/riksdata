"""Registry loading and validation errors."""

from datetime import date
from pathlib import Path

import pytest

from riksdata.registry import RegistryError, load_registry

REPO_ROOT = Path(__file__).resolve().parents[1]

SOURCE_TEMPLATE = """
{source_id}:
  name: Demo source
  publisher: Demo publisher
  homepage: https://example.org
  api_base: https://example.org/api
  licence: CC-BY-4.0
  licence_url: https://example.org/licence
  attribution: "Source: Demo"
  rate_limit: {{calls: 10, per_seconds: 60}}
  tier: 2
  access: api
  redistribution: {redistribution}
  terms_checked: 2026-10-03
"""

DATASET = """
- dataset: "07391"
  slug: taxes
  title_no: Skatter
  topic: public_finance
  schedule: daily
"""


def write_registry(
    root: Path,
    datasets: dict[str, str],
    sources: dict[str, str] | None = None,
) -> Path:
    """Write a registry where `sources` maps source id to its `redistribution` setting."""
    sources = sources or {"demo": "attribution"}
    (root / "datasets").mkdir(parents=True)
    (root / "sources.yaml").write_text(
        "".join(
            SOURCE_TEMPLATE.format(source_id=source_id, redistribution=redistribution)
            for source_id, redistribution in sources.items()
        ),
        encoding="utf-8",
    )
    for source_id, body in datasets.items():
        (root / "datasets" / f"{source_id}.yaml").write_text(body, encoding="utf-8")
    return root


def test_repo_registry_loads() -> None:
    registry = load_registry(REPO_ROOT / "registry")

    assert {"ssb", "owid"} <= set(registry.sources)
    assert registry.sources["ssb"].rate_limit.calls == 35
    assert registry.sources["ssb"].terms_checked == date(2026, 10, 3)
    assert all(ds.source_id in registry.sources for ds in registry.datasets)


def test_dataset_defaults(tmp_path: Path) -> None:
    body = """
- dataset: life-expectancy
  title_no: Forventet levealder
  topic: health
  schedule: weekly
"""
    registry = load_registry(write_registry(tmp_path, {"demo": body}))

    (ds,) = registry.datasets
    assert ds.source_id == "demo"
    assert ds.slug == "life-expectancy"
    assert ds.key == "demo/life-expectancy"
    assert ds.publish is True
    assert registry.sources["demo"].timeout_seconds == 60


def test_restricted_source_defaults_to_unpublished(tmp_path: Path) -> None:
    opt_in = DATASET + "  publish: true\n"
    registry = load_registry(
        write_registry(
            tmp_path,
            {"closed": DATASET, "optin": opt_in},
            sources={"closed": "restricted", "optin": "restricted"},
        )
    )

    publish = {ds.source_id: ds.publish for ds in registry.datasets}
    assert publish == {"closed": False, "optin": True}


def test_select_by_source_dataset_and_slug(tmp_path: Path) -> None:
    registry = load_registry(write_registry(tmp_path, {"demo": DATASET}))

    assert [ds.dataset for ds in registry.select(source="demo")] == ["07391"]
    assert [ds.dataset for ds in registry.select(dataset="07391")] == ["07391"]
    assert [ds.dataset for ds in registry.select(dataset="taxes")] == ["07391"]
    assert registry.select(source="other") == []
    assert registry.select(dataset="missing") == []


def test_dataset_file_for_unknown_source(tmp_path: Path) -> None:
    with pytest.raises(RegistryError, match=r"nosuch\.yaml: no source 'nosuch'"):
        load_registry(write_registry(tmp_path, {"nosuch": DATASET}))


def test_duplicate_slug_within_source(tmp_path: Path) -> None:
    second = DATASET.replace('"07391"', '"14710"')
    with pytest.raises(RegistryError, match="duplicate slug within a source: demo/taxes"):
        load_registry(write_registry(tmp_path, {"demo": DATASET + second}))


def test_unquoted_table_id_is_rejected(tmp_path: Path) -> None:
    # YAML reads 07321 as octal 3793, which would silently fetch the wrong table.
    unquoted = DATASET.replace('"07391"', "07321")
    with pytest.raises(RegistryError, match="must be a quoted string, got 3793"):
        load_registry(write_registry(tmp_path, {"demo": unquoted}))


def test_unquoted_value_code_is_rejected(tmp_path: Path) -> None:
    body = DATASET + "  select:\n    Kjonn: [0]\n"
    with pytest.raises(RegistryError, match=r"select\.Kjonn\.0: Input should be a valid string"):
        load_registry(write_registry(tmp_path, {"demo": body}))


def test_unknown_field_is_rejected(tmp_path: Path) -> None:
    typo = DATASET + "  shedule: weekly\n"
    with pytest.raises(RegistryError, match="shedule: Extra inputs are not permitted"):
        load_registry(write_registry(tmp_path, {"demo": typo}))


def test_missing_sources_file(tmp_path: Path) -> None:
    with pytest.raises(RegistryError, match=r"sources\.yaml: file not found"):
        load_registry(tmp_path)
