"""SSB adapter, against responses recorded from the live API (see tests/fixtures/README.md)."""

import json
import logging
from datetime import UTC, date, datetime
from typing import Any

import httpx
import polars as pl
import pytest

from riksdata.adapters import ssb
from riksdata.adapters.base import RawArtifact, check_batch
from riksdata.adapters.ssb import SsbAdapter
from riksdata.http import HttpClient
from riksdata.registry import DatasetSpec, load_registry
from support import FIXTURES, REPO_ROOT, RETRIEVED_AT, make_dataset, make_source

BASE = "https://data.ssb.no/api/pxwebapi/v2"

LFS = make_dataset(
    source_id="ssb",
    dataset="13760",
    slug="aku",
    title_no="Arbeidskraftundersøkelsen",
    title_en="Labour force survey",
    topic="labour",
    frequency="M",
    select={
        "Kjonn": ["0"],
        "Alder": ["15-74"],
        "Justering": ["S"],
        "ContentsCode": ["Arbeidsstyrken", "ArbledProsArbstyrk"],
        "Tid": ["2026M06", "2026M07", "2026M08"],
    },
    series_key=["Kjonn", "Alder", "Justering", "ContentsCode"],
    entity="NOR",
)

POPULATION = make_dataset(
    source_id="ssb",
    dataset="05803",
    slug="befolkning",
    title_no="Befolkning",
    title_en="Population",
    topic="population",
    frequency="A",
    select={
        "ContentsCode": ["Personer", "Skilsmisse", "Innflyttinger"],
        "Tid": ["1735", "1736", "2025", "2026"],
    },
    series_key=["ContentsCode"],
    entity="NOR",
)


def fixture(name: str) -> bytes:
    return (FIXTURES / "ssb" / name).read_bytes()


def raw(dataset: str) -> RawArtifact:
    return RawArtifact(
        url=f"{BASE}/tables/{dataset}/data",
        fetched_at=RETRIEVED_AT,
        content_type="application/json; charset=UTF-8",
        content=fixture(f"{dataset}_data_no.json"),
        meta={"metadata_en": json.loads(fixture(f"{dataset}_metadata_en.json"))},
    )


def make_adapter(routes: dict[str, bytes] | None = None) -> tuple[SsbAdapter, list[httpx.Request]]:
    """An adapter whose HTTP calls are answered from `routes` (URL path -> body)."""
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        key = request.url.path.removeprefix("/api/pxwebapi/v2")
        if key == "/tables":
            key = f"/tables?{request.url.params['lang']}&{request.url.params['pageNumber']}"
        body = (routes or {}).get(key)
        if body is None:
            return httpx.Response(404, text=f"no fixture for {key}")
        return httpx.Response(200, content=body, headers={"content-type": "application/json"})

    source = make_source(
        source_id="ssb", api_base=BASE, attribution="Kilde: Statistisk sentralbyrå"
    )
    return SsbAdapter(source, HttpClient(source, transport=httpx.MockTransport(handler))), seen


def row(frame: pl.DataFrame, series_id: str) -> dict[str, Any]:
    return frame.row(by_predicate=pl.col("series_id") == series_id, named=True)


def test_normalize_labour_force_fixture() -> None:
    adapter, _ = make_adapter()

    batch = adapter.normalize(raw("13760"), LFS)

    check_batch(batch)
    assert batch.series["series_id"].to_list() == [
        "ssb.13760.0_15-74_s_arbeidsstyrken",
        "ssb.13760.0_15-74_s_arbledprosarbstyrk",
    ]
    assert batch.observations.height == 6

    rate = row(batch.series, "ssb.13760.0_15-74_s_arbledprosarbstyrk")
    assert rate == {
        "series_id": "ssb.13760.0_15-74_s_arbledprosarbstyrk",
        "source_id": "ssb",
        "dataset_id": "13760",
        "dims": '{"Kjonn": "0", "Alder": "15-74", "Justering": "S", '
        '"ContentsCode": "ArbledProsArbstyrk"}',
        "title_no": "Arbeidskraftundersøkelsen: Arbeidsledige i prosent av arbeidsstyrken",
        "title_en": "Labour force survey: Unemployment rate (LFS)",
        "unit": "prosent",
        "unit_mult": 0,
        "frequency": "M",
        "concept": None,
        "coverage": None,
        "topic": "labour",
        "tag": "DATA",
        "estimate_by": None,
        "publish": True,
        "source_url": "https://www.ssb.no/statbank/table/13760",
        "citation": "Kilde: Statistisk sentralbyrå, tabell 13760",
        "licence": "CC-BY-4.0",
        "first_period": "2026-06",
        "last_period": "2026-08",
        "source_updated": datetime(2026, 9, 23, 6, 0, tzinfo=UTC),
        "retrieved_at": RETRIEVED_AT,
    }
    assert row(batch.series, "ssb.13760.0_15-74_s_arbeidsstyrken")["unit"] == "1000 personer"

    values = batch.observations.filter(
        pl.col("series_id") == "ssb.13760.0_15-74_s_arbledprosarbstyrk"
    )
    assert values.rows(named=True) == [
        {
            "series_id": "ssb.13760.0_15-74_s_arbledprosarbstyrk",
            "entity_id": "NOR",
            "period": period,
            "period_start": start,
            "value": value,
            "status": None,
            "vintage": date(2026, 10, 3),
        }
        for period, start, value in [
            ("2026-06", date(2026, 6, 1), 4.6),
            ("2026-07", date(2026, 7, 1), 4.2),
            ("2026-08", date(2026, 8, 1), 4.5),
        ]
    ]
    labour_force = batch.observations.filter(
        pl.col("series_id") == "ssb.13760.0_15-74_s_arbeidsstyrken"
    )
    assert labour_force["value"].to_list() == [3057.0, 3071.0, 3064.0]


def test_normalize_keeps_missing_cells_with_their_status() -> None:
    adapter, _ = make_adapter()

    batch = adapter.normalize(raw("05803"), POPULATION)

    check_batch(batch)
    assert batch.series["series_id"].to_list() == [
        "ssb.05803.innflyttinger",
        "ssb.05803.personer",
        "ssb.05803.skilsmisse",
    ]
    assert batch.observations.height == 12

    population = batch.observations.filter(pl.col("series_id") == "ssb.05803.personer")
    assert population["period"].to_list() == ["1735", "1736", "2025", "2026"]
    assert population["period_start"][0] == date(1735, 1, 1)
    assert population["value"].to_list() == [616109.0, 622197.0, 5594340.0, 5627400.0]
    assert population["status"].to_list() == [None] * 4

    divorces = batch.observations.filter(pl.col("series_id") == "ssb.05803.skilsmisse")
    assert divorces["value"].to_list() == [None, None, 0.0, None]
    assert divorces["status"].to_list() == ["..", "..", None, ".."]

    # first/last period only count periods that have a value.
    assert row(batch.series, "ssb.05803.personer")["first_period"] == "1735"
    assert row(batch.series, "ssb.05803.personer")["last_period"] == "2026"
    assert row(batch.series, "ssb.05803.innflyttinger")["first_period"] == "2025"
    assert row(batch.series, "ssb.05803.innflyttinger")["last_period"] == "2025"
    assert row(batch.series, "ssb.05803.personer")["title_no"] == "Befolkning: Befolkning 1. januar"
    assert row(batch.series, "ssb.05803.personer")["title_en"] == "Population: Population 1 January"
    assert row(batch.series, "ssb.05803.skilsmisse")["unit"] == "skilsmisser"


def test_labels_lose_the_sub_category_mark() -> None:
    # SSB prefixes sub-categories with "¬ " (table 08484: "¬ Eiendomstyveri").
    labels = {"a": "¬ Eiendomstyveri", "b": "¬¬  Tyveri\tfrå butikk ", "c": "Alle lovbrudd"}
    dimensions = {"Lovbrudd": {"category": {"label": labels}}}

    assert [ssb._label(dimensions, "Lovbrudd", code) for code in ("a", "b", "c", "d")] == [
        "Eiendomstyveri",
        "Tyveri frå butikk",
        "Alle lovbrudd",
        "d",  # no label: the code itself
    ]


def test_normalize_is_deterministic() -> None:
    adapter, _ = make_adapter()

    first = adapter.normalize(raw("13760"), LFS)
    second = adapter.normalize(raw("13760"), LFS)

    assert first.series.equals(second.series)
    assert first.observations.equals(second.observations)


def test_series_key_must_cover_every_varying_dimension() -> None:
    adapter, _ = make_adapter()
    loose = LFS.model_copy(update={"series_key": ["Kjonn"]})

    with pytest.raises(ValueError, match=r"not in the key: \['ContentsCode'\]"):
        adapter.normalize(raw("13760"), loose)


def test_registry_frequency_must_match_the_data() -> None:
    adapter, _ = make_adapter()
    annual = LFS.model_copy(update={"frequency": "A"})

    with pytest.raises(ValueError, match=r"registry says frequency A, data has \['M'\]"):
        adapter.normalize(raw("13760"), annual)


def test_fetch_passes_explicit_value_codes_for_every_dimension() -> None:
    adapter, seen = make_adapter(
        {
            "/tables/13760/metadata": fixture("13760_metadata_en.json"),
            "/tables/13760/data": fixture("13760_data_no.json"),
        }
    )

    artifact = adapter.fetch(LFS)

    metadata_request, data_request = seen
    assert dict(metadata_request.url.params) == {"lang": "en"}
    assert dict(data_request.url.params) == {
        "lang": "no",
        "outputFormat": "json-stat2",
        "valueCodes[Kjonn]": "0",
        "valueCodes[Alder]": "15-74",
        "valueCodes[Justering]": "S",
        "valueCodes[ContentsCode]": "Arbeidsstyrken,ArbledProsArbstyrk",
        "valueCodes[Tid]": "2026M06,2026M07,2026M08",
    }
    assert artifact.content == fixture("13760_data_no.json")
    assert artifact.content_type == "application/json"
    assert artifact.url.startswith(f"{BASE}/tables/13760/data?lang=no")
    assert artifact.meta["metadata_en"]["id"] == [
        "Kjonn",
        "Alder",
        "Justering",
        "ContentsCode",
        "Tid",
    ]
    assert artifact.fetched_at.tzinfo is not None
    check_batch(adapter.normalize(artifact, LFS))


@pytest.mark.parametrize(
    ("select", "message"),
    [
        (
            {"Kjonn": ["0"], "Alder": ["15-74"], "ContentsCode": ["Sysselsatte"], "Tid": ["*"]},
            r"missing: \['Justering'\]",
        ),
        ({**LFS.select, "Region": ["0301"]}, r"unknown: \['Region'\]"),
        ({**LFS.select, "Kjonn": ["9"]}, r"Kjonn has no codes \['9'\]"),
        # "*" would let SSB add series behind our back; only the time dimension may use it.
        ({**LFS.select, "Kjonn": ["*"]}, r"Kjonn: only the time dimension \(Tid\) may use"),
        ({**LFS.select, "Alder": ["top(2)"]}, r"Alder: only the time dimension"),
    ],
)
def test_fetch_rejects_a_selection_that_does_not_fit_the_table(
    select: dict[str, list[str]], message: str
) -> None:
    adapter, seen = make_adapter({"/tables/13760/metadata": fixture("13760_metadata_en.json")})

    with pytest.raises(ValueError, match=message):
        adapter.fetch(LFS.model_copy(update={"select": select}))

    assert [request.url.path.rsplit("/", 1)[-1] for request in seen] == ["metadata"]


def test_fetch_rejects_a_selection_over_the_cell_limit(monkeypatch: pytest.MonkeyPatch) -> None:
    adapter, _ = make_adapter({"/tables/13760/metadata": fixture("13760_metadata_en.json")})
    every_month = LFS.model_copy(update={"select": {**LFS.select, "Tid": ["*"]}})
    monkeypatch.setattr(ssb, "MAX_CELLS", 400)

    # 1 sex x 1 age x 1 adjustment x 2 contents x 248 months = 496 cells.
    with pytest.raises(ValueError, match="selection is 496 cells; SSB allows 400"):
        adapter.fetch(every_month)


def test_remote_updated_reads_the_table_timestamp(caplog: pytest.LogCaptureFixture) -> None:
    adapter, seen = make_adapter({"/tables/13760": fixture("table_13760_en.json")})

    with caplog.at_level(logging.WARNING):
        updated = adapter.remote_updated(LFS)

    assert updated == datetime(2026, 9, 23, 6, 0, tzinfo=UTC)
    assert dict(seen[0].url.params) == {"lang": "en"}
    assert caplog.records == []


def test_a_discontinued_table_warns_loudly(caplog: pytest.LogCaptureFixture) -> None:
    adapter, _ = make_adapter({"/tables/03013": fixture("table_03013_en.json")})
    closed = LFS.model_copy(update={"dataset": "03013"})

    with caplog.at_level(logging.WARNING):
        adapter.remote_updated(closed)

    (record,) = caplog.records
    assert record.levelno == logging.WARNING
    assert "SSB TABLE 03013 IS DISCONTINUED" in record.getMessage()
    assert "superseded_by" in record.getMessage()


def test_catalog_merges_both_languages_across_pages() -> None:
    adapter, seen = make_adapter(
        {
            f"/tables?{lang}&{page}": fixture(f"tables_{lang}_page{page}.json")
            for lang in ("no", "en")
            for page in (1, 2)
        }
    )

    catalog = adapter.catalog(include_discontinued=True)

    assert len(seen) == 4
    assert all(request.url.params["includeDiscontinued"] == "true" for request in seen)
    assert all(request.url.params["pageSize"] == "10000" for request in seen)
    assert catalog.rows(named=True) == [
        {
            "id": "03013",
            "label_no": "03013: Konsumprisindeks, etter konsumgruppe (2015=100) (avslutta serie) "
            "1979M01-2025M12",
            "label_en": "03013: Consumer Price Index, by consumption group (2015=100) "
            "(closed series) 1979M01-2025M12",
            "updated": "2026-01-09T07:00:00Z",
            "first_period": "1979M01",
            "last_period": "2025M12",
            "time_unit": "Monthly",
            "subject_code": "pp",
            "variable_names": ["consumption group", "contents", "month"],
            "discontinued": True,
        },
        {
            "id": "14710",
            "label_no": "14710: Konsumprisindeks, historisk serie (2025=100) 1920M03-2026M08",
            "label_en": "14710: Consumer price index (2025=100) 1920M03-2026M08",
            "updated": "2026-09-10T06:00:00Z",
            "first_period": "1920M03",
            "last_period": "2026M08",
            "time_unit": "Monthly",
            "subject_code": "pp",
            "variable_names": ["contents", "month"],
            "discontinued": False,
        },
    ]


def test_catalog_leaves_out_discontinued_tables_by_default() -> None:
    adapter, seen = make_adapter(
        {f"/tables?{lang}&1": fixture(f"tables_{lang}_page1.json") for lang in ("no", "en")}
        | {f"/tables?{lang}&2": fixture(f"tables_{lang}_page2.json") for lang in ("no", "en")}
    )

    adapter.catalog()

    assert all("includeDiscontinued" not in request.url.params for request in seen)


def ssb_datasets() -> list[DatasetSpec]:
    return load_registry(REPO_ROOT / "registry").select(source="ssb")


def test_registry_entries_are_complete() -> None:
    datasets = ssb_datasets()

    assert [ds.dataset for ds in datasets] == [
        "14710",
        "13760",
        "05803",
        "14669",
        "07391",
        "12439",
        "09842",
        "10318",
        "08815",
        "13151",
        "07221",
        "09695",
        "08484",
    ]
    # SSB publishes marriages and divorces as 0 for missing years, so 05803 leaves them out.
    population = next(ds for ds in datasets if ds.dataset == "05803")
    assert not {"InngEkteskap", "Skilsmisse"} & set(population.select["ContentsCode"])
    # 07391 is accumulated through the year, and its petroleum taxes are 0 in some Januaries.
    assert [ds.dataset for ds in datasets if ds.real_zeros] == ["07391"]
    for ds in datasets:
        assert ds.entity == "NOR", ds.key
        assert ds.frequency in ("A", "Q", "M"), ds.key
        assert ds.title_en, ds.key
        assert ds.select["Tid"] == ["*"], ds.key
        # every non-time dimension is pinned to explicit codes and is part of the series key
        assert ds.series_key == [dim for dim in ds.select if dim != "Tid"], ds.key
        assert not any(
            ssb._is_expression(code) for dim in ds.series_key for code in ds.select[dim]
        ), ds.key


@pytest.mark.live
def test_live_fetch_and_normalize_smallest_table() -> None:
    registry = load_registry(REPO_ROOT / "registry")
    (ds,) = registry.select(source="ssb", dataset="09842")
    client = HttpClient(registry.sources["ssb"])
    try:
        adapter = SsbAdapter(registry.sources["ssb"], client)
        updated = adapter.remote_updated(ds)
        batch = adapter.normalize(adapter.fetch(ds), ds)
    finally:
        client.close()

    check_batch(batch)
    assert updated is not None
    assert batch.series.height == 6
    assert batch.observations.height >= 6 * 55
    assert batch.series["unit"].unique().to_list() == ["kr per innbygger"]
