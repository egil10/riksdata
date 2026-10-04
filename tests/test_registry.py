"""Registry loading and validation errors."""

from datetime import date
from pathlib import Path

import pytest

from riksdata.registry import RegistryError, load_registry
from support import REPO_ROOT, write_registry

DATASET = """
- dataset: "07391"
  slug: taxes
  title_no: Skatter
  topic: public_finance
  schedule: daily
"""


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
    assert (ds.pii, ds.chunk_by, ds.terms_note) == ("none", None, None)
    assert ds.real_zeros is False
    source = registry.sources["demo"]
    assert source.timeout_seconds == 60
    assert (source.runner, source.secret_env) == ("box", None)
    assert (source.encoding, source.delimiter, source.decimal) == ("utf-8", ",", ".")


def test_plan_v3_fields_are_validated(tmp_path: Path) -> None:
    chunked = DATASET + "  pii: hash_ids\n  chunk_by: {Tid: 1, Region: 25}\n"
    registry = load_registry(write_registry(tmp_path / "ok", {"demo": chunked}))

    (ds,) = registry.datasets
    assert (ds.pii, ds.chunk_by) == ("hash_ids", {"Tid": 1, "Region": 25})

    with pytest.raises(
        RegistryError, match="pii: Input should be 'none', 'aggregate' or 'hash_ids'"
    ):
        load_registry(write_registry(tmp_path / "bad", {"demo": DATASET + "  pii: maybe\n"}))


def test_terms_note_is_loaded(tmp_path: Path) -> None:
    noted = DATASET + "  terms_note: Brukt ikke-kommersielt med kildehenvisning.\n"

    (ds,) = load_registry(write_registry(tmp_path, {"demo": noted})).datasets

    assert ds.terms_note == "Brukt ikke-kommersielt med kildehenvisning."


def test_real_zeros_is_loaded(tmp_path: Path) -> None:
    marked = DATASET + "  real_zeros: true\n"

    (ds,) = load_registry(write_registry(tmp_path, {"demo": marked})).datasets

    assert ds.real_zeros is True


def test_a_source_cannot_ask_for_another_user_agent(tmp_path: Path) -> None:
    # We only ever send our own User-Agent, so there is no setting for it.
    root = write_registry(tmp_path, {"demo": DATASET})
    sources = root / "sources.yaml"
    sources.write_text(
        sources.read_text(encoding="utf-8") + "  user_agent: browser\n", encoding="utf-8"
    )

    with pytest.raises(RegistryError, match="user_agent: Extra inputs are not permitted"):
        load_registry(root)


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
