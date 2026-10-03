"""OWID adapter, against trimmed recordings of the live API (see tests/fixtures/README.md)."""

import copy
import json
from datetime import UTC, date, datetime
from typing import Any

import httpx
import polars as pl
import pytest

from riksdata.adapters.base import RawArtifact, check_batch
from riksdata.adapters.owid import OwidAdapter
from riksdata.http import HttpClient
from riksdata.registry import DatasetSpec, load_registry
from support import FIXTURES, REPO_ROOT, RETRIEVED_AT, make_dataset, make_source

GRAPHER = "https://ourworldindata.org/grapher"
QUERY = {"v": "1", "csvType": "full", "useColumnShortNames": "true"}
ESTIMATES = "median_age__sex_all__age_all__variant_estimates"
PROJECTION = "median_age__sex_all__age_all__variant_medium"

# chart slug -> {column short name: OWID indicator id}
INDICATORS = {
    "life-expectancy": {"life_expectancy_0": 1118466},
    "median-age": {ESTIMATES: 950958, PROJECTION: 950961},
    "gdp-per-capita-worldbank": {"ny_gdp_pcap_pp_kd": 1294305},
}


def fixture(name: str) -> bytes:
    return (FIXTURES / "owid" / name).read_bytes()


def dataset(slug: str, title_no: str, entities: list[str]) -> DatasetSpec:
    return make_dataset(
        source_id="owid",
        dataset=slug,
        slug=slug,
        title_no=title_no,
        title_en=None,
        topic="demo",
        frequency=None,
        schedule="weekly",
        entities=entities,
    )


LIFE = dataset("life-expectancy", "Forventet levealder ved fødsel", ["NOR", "SWE", "OWID_WRL"])
MEDIAN_AGE = dataset("median-age", "Medianalder", ["NOR", "OWID_WRL"])
GDP = dataset("gdp-per-capita-worldbank", "BNP per innbygger", ["NOR", "USA", "OWID_WRL"])


def raw(slug: str) -> RawArtifact:
    return RawArtifact(
        url=f"{GRAPHER}/{slug}.csv",
        fetched_at=RETRIEVED_AT,
        content_type="text/csv",
        content=fixture(f"{slug}.csv"),
        meta={
            "metadata": json.loads(fixture(f"{slug}.metadata.json")),
            "indicators": {
                short: json.loads(fixture(f"indicator_{indicator_id}.json"))
                for short, indicator_id in INDICATORS[slug].items()
            },
        },
    )


def make_adapter(slug: str | None = None) -> tuple[OwidAdapter, list[httpx.Request]]:
    """An adapter whose HTTP calls are answered from the fixtures of one chart."""
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        name = request.url.path.rsplit("/", 1)[-1]
        if request.url.host == "api.ourworldindata.org":
            name = f"indicator_{name.removesuffix('.metadata.json')}.json"
        content_type = "text/csv" if name.endswith(".csv") else "application/json"
        return httpx.Response(200, content=fixture(name), headers={"content-type": content_type})

    source = make_source(source_id="owid", api_base=GRAPHER, attribution="Our World in Data")
    return OwidAdapter(source, HttpClient(source, transport=httpx.MockTransport(handler))), seen


def row(frame: pl.DataFrame, series_id: str) -> dict[str, Any]:
    return frame.row(by_predicate=pl.col("series_id") == series_id, named=True)


def test_normalize_single_column_chart() -> None:
    adapter, _ = make_adapter()

    batch = adapter.normalize(raw("life-expectancy"), LIFE)

    check_batch(batch)
    assert batch.series.rows(named=True) == [
        {
            "series_id": "owid.life-expectancy",
            "source_id": "owid",
            "dataset_id": "life-expectancy",
            "dims": '{"column": "life_expectancy_0"}',
            "title_no": "Forventet levealder ved fødsel",
            "title_en": "Life expectancy",
            "unit": "years",
            "unit_mult": 0,
            "frequency": "A",
            "concept": None,
            "coverage": None,
            "topic": "demo",
            "tag": "DATA",
            "estimate_by": None,
            "publish": True,
            "source_url": "https://ourworldindata.org/grapher/life-expectancy",
            "citation": "Riley (2005); Zijdeman et al. (2015); HMD (2025); UN WPP (2024) – "
            "with major processing by Our World in Data",
            "licence": "CC BY 4.0; CC BY 3.0 IGO; CC0 1.0 Universal; JSTOR terms",
            "first_period": "2019",
            "last_period": "2023",
            "source_updated": datetime(2025, 10, 22, tzinfo=UTC),
            "retrieved_at": RETRIEVED_AT,
        }
    ]
    # France is in the file but not in the registry entry; OWID_WRL becomes WORLD.
    assert batch.observations["entity_id"].unique().sort().to_list() == ["NOR", "SWE", "WORLD"]
    assert batch.observations.height == 15
    norway_2023 = batch.observations.row(
        by_predicate=(pl.col("entity_id") == "NOR") & (pl.col("period") == "2023"), named=True
    )
    assert norway_2023 == {
        "series_id": "owid.life-expectancy",
        "entity_id": "NOR",
        "period": "2023",
        "period_start": date(2023, 1, 1),
        "value": 83.3078,
        "status": None,
        "vintage": date(2026, 10, 3),
    }


def test_projection_column_becomes_its_own_estimate_series() -> None:
    adapter, _ = make_adapter()

    batch = adapter.normalize(raw("median-age"), MEDIAN_AGE)

    check_batch(batch)
    estimates = row(batch.series, f"owid.median-age.{ESTIMATES}")
    projection = row(batch.series, f"owid.median-age.{PROJECTION}")
    assert batch.series.height == 2
    assert (estimates["tag"], estimates["estimate_by"]) == ("DATA", None)
    assert (projection["tag"], projection["estimate_by"]) == ("ESTIMATE", "publisher")
    assert (estimates["first_period"], estimates["last_period"]) == ("2021", "2023")
    assert (projection["first_period"], projection["last_period"]) == ("2024", "2026")
    assert estimates["title_no"] == "Medianalder: Median age - UN WPP"
    assert projection["title_en"] == "Median age - UN WPP – with medium scenario projections"
    assert projection["dims"] == f'{{"column": "{PROJECTION}"}}'
    assert projection["licence"] == "CC BY 3.0 IGO"

    # Blank cells in the wide CSV are dropped rather than stored as missing values.
    assert batch.observations.height == 12
    assert batch.observations["value"].null_count() == 0
    projected = batch.observations.filter(
        (pl.col("series_id") == f"owid.median-age.{PROJECTION}") & (pl.col("entity_id") == "NOR")
    )
    assert projected.select("period", "value").rows() == [
        ("2024", 39.668),
        ("2025", 39.846),
        ("2026", 40.097),
    ]


def test_annotation_columns_are_not_series() -> None:
    adapter, _ = make_adapter()

    batch = adapter.normalize(raw("gdp-per-capita-worldbank"), GDP)

    check_batch(batch)
    assert batch.series["series_id"].to_list() == ["owid.gdp-per-capita-worldbank"]
    assert batch.series["unit"].to_list() == ["international-$ in 2021 prices"]
    assert batch.series["licence"].to_list() == ["CC BY 4.0"]
    assert batch.observations.height == 12
    norway = batch.observations.filter(pl.col("entity_id") == "NOR")
    assert norway["value"].to_list() == [95109.82, 94364.96, 94803.67, 95173.43]


def test_non_redistributable_indicator_is_not_published() -> None:
    adapter, _ = make_adapter()
    artifact = raw("life-expectancy")
    meta = copy.deepcopy(artifact.meta)
    meta["indicators"]["life_expectancy_0"]["nonRedistributable"] = True

    batch = adapter.normalize(RawArtifact(**{**artifact.__dict__, "meta": meta}), LIFE)

    assert batch.series["publish"].to_list() == [False]


def test_missing_indicator_metadata_leaves_the_licence_empty() -> None:
    adapter, _ = make_adapter()
    artifact = raw("life-expectancy")
    meta = {"metadata": artifact.meta["metadata"], "indicators": {}}

    batch = adapter.normalize(RawArtifact(**{**artifact.__dict__, "meta": meta}), LIFE)

    # `riksdata validate` then fails on the missing licence instead of us guessing one.
    assert batch.series["licence"].to_list() == [None]


def test_daily_charts_use_iso_dates() -> None:
    # Synthetic: none of the starter charts is daily, so this covers the `day` branch only.
    adapter, _ = make_adapter()
    artifact = raw("life-expectancy")
    daily = (
        b"entity,code,day,life_expectancy_0\nNorway,NOR,2026-08-30,1.5\nNorway,NOR,2026-08-31,2.5\n"
    )

    batch = adapter.normalize(RawArtifact(**{**artifact.__dict__, "content": daily}), LIFE)

    assert batch.series["frequency"].to_list() == ["D"]
    assert batch.observations.select("period", "period_start", "value").rows() == [
        ("2026-08-30", date(2026, 8, 30), 1.5),
        ("2026-08-31", date(2026, 8, 31), 2.5),
    ]


@pytest.mark.parametrize(
    ("content", "message"),
    [
        (b"entity,code,decade,life_expectancy_0\nNorway,NOR,2020,1\n", "expected entity, code"),
        (b"entity,code,year,other\nNorway,NOR,2020,1\n", "no column for 'life_expectancy_0'"),
        (b"entity,code,year,life_expectancy_0\nNorway,NOR,-10000,1\n", "cannot use '-10000'"),
    ],
)
def test_unexpected_csv_shapes_raise(content: bytes, message: str) -> None:
    adapter, _ = make_adapter()
    artifact = raw("life-expectancy")

    with pytest.raises(ValueError, match=message):
        adapter.normalize(RawArtifact(**{**artifact.__dict__, "content": content}), LIFE)


def test_registry_frequency_must_match_the_data() -> None:
    adapter, _ = make_adapter()

    with pytest.raises(ValueError, match="registry says frequency M, data is A"):
        adapter.normalize(raw("life-expectancy"), LIFE.model_copy(update={"frequency": "M"}))


def test_remote_updated_is_the_latest_column_date() -> None:
    adapter, seen = make_adapter()

    updated = adapter.remote_updated(MEDIAN_AGE)

    assert updated == datetime(2024, 7, 12, tzinfo=UTC)
    assert str(seen[0].url).startswith(f"{GRAPHER}/median-age.metadata.json?")
    assert dict(seen[0].url.params) == QUERY


def test_fetch_collects_csv_chart_metadata_and_indicator_metadata() -> None:
    adapter, seen = make_adapter()

    adapter.remote_updated(MEDIAN_AGE)
    artifact = adapter.fetch(MEDIAN_AGE)

    # The chart metadata from remote_updated() is reused, so it is requested once.
    assert [request.url.path for request in seen] == [
        "/grapher/median-age.metadata.json",
        "/v1/indicators/950958.metadata.json",
        "/v1/indicators/950961.metadata.json",
        "/grapher/median-age.csv",
    ]
    assert dict(seen[-1].url.params) == QUERY
    assert artifact.content == fixture("median-age.csv")
    assert artifact.content_type == "text/csv"
    assert set(artifact.meta) == {"metadata", "indicators"}
    assert set(artifact.meta["indicators"]) == {ESTIMATES, PROJECTION}
    check_batch(adapter.normalize(artifact, MEDIAN_AGE))


def test_owid_has_no_catalogue() -> None:
    adapter, seen = make_adapter()

    assert adapter.catalog() is None
    assert seen == []


def test_registry_entries_are_complete() -> None:
    datasets = load_registry(REPO_ROOT / "registry").select(source="owid")

    assert [ds.dataset for ds in datasets] == [
        "life-expectancy",
        "co-emissions-per-capita",
        "children-per-woman-un",
        "homicide-rate-unodc",
        "military-spending-as-a-share-of-gdp-sipri",
        "median-age",
        "share-of-individuals-using-the-internet",
        "child-mortality",
        "gdp-per-capita-worldbank",
        "daily-per-capita-caloric-supply",
        "gdp-per-capita-maddison-project-database",
        "share-of-electricity-production-from-renewable-sources",
        "total-tax-revenues-gdp",
        "annual-working-hours-per-worker",
        "oil-production-by-country",
    ]
    for ds in datasets:
        assert ds.entities == ["NOR", "SWE", "DNK", "FIN", "ISL", "DEU", "GBR", "USA", "OWID_WRL"]
        assert ds.schedule == "weekly", ds.key
    # Charts with non-commercial or unread upstream terms stay out of site exports.
    assert {ds.dataset for ds in datasets if not ds.publish} == {
        "homicide-rate-unodc",
        "military-spending-as-a-share-of-gdp-sipri",
        "child-mortality",
        "daily-per-capita-caloric-supply",
        "oil-production-by-country",
    }


@pytest.mark.live
def test_live_fetch_and_normalize_one_chart() -> None:
    registry = load_registry(REPO_ROOT / "registry")
    (ds,) = registry.select(source="owid", dataset="gdp-per-capita-worldbank")
    client = HttpClient(registry.sources["owid"])
    try:
        adapter = OwidAdapter(registry.sources["owid"], client)
        updated = adapter.remote_updated(ds)
        batch = adapter.normalize(adapter.fetch(ds), ds)
    finally:
        client.close()

    check_batch(batch)
    assert updated is not None
    assert batch.series["series_id"].to_list() == ["owid.gdp-per-capita-worldbank"]
    assert batch.series["licence"].to_list() == ["CC BY 4.0"]
    assert set(batch.observations["entity_id"].unique()) >= {"NOR", "SWE", "WORLD"}
