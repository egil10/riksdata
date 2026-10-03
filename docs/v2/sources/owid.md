# Our World in Data: grapher charts

| | |
|---|---|
| Adapter | `py/riksdata/adapters/owid.py` |
| Registry | `owid` in `registry/sources.yaml`, datasets in `registry/datasets/owid.yaml` |
| Base URLs | `https://ourworldindata.org/grapher` (charts) and `https://api.ourworldindata.org/v1/indicators` (indicator metadata) |
| Auth | None |
| Limits | None published. We cap ourselves at 30 calls per 60 s |
| Licence | OWID's own work is CC BY 4.0. Third-party data keeps the provider's terms (<https://ourworldindata.org/faqs>, checked 2026-10-03). See "Licences" below |
| Attribution | Per series: `citation` holds OWID's `citationShort` |

## Endpoints used

| Call | Used for |
|---|---|
| `GET /grapher/{slug}.metadata.json?v=1&csvType=full&useColumnShortNames=true` | Chart metadata: columns, units, titles, citations, `lastUpdated`. Also the staleness probe |
| `GET https://api.ourworldindata.org/v1/indicators/{id}.metadata.json` | One per numeric column: upstream origins with their licences, and `nonRedistributable`. The URL is `fullMetadata` in the chart metadata |
| `GET /grapher/{slug}.csv?v=1&csvType=full&useColumnShortNames=true` | The data for every entity and year |

One `update` costs three calls per chart (four for a chart with two numeric columns). The ten starter charts take 31 calls, so a full run takes about a minute with our cap.

## How a chart becomes series

- **One series per numeric column.** The id is `owid.<slug>` when the chart has one numeric column, otherwise `owid.<slug>.<short_name>`. Columns that aren't numeric are annotations and are skipped, for example `owid_region` (type `Continent`).
- **Projections are estimates, not data.** OWID marks a projection column with the suffix `__projected` in the CSV (the metadata key has no suffix). Such a series gets `tag = ESTIMATE` and `estimate_by = publisher`. Today that is the UN medium-scenario series in `median-age`, which runs to 2100.
- **Entities** are filtered to the registry's `entities` after download. `entity_id` is the ISO3 `code`, except `OWID_WRL`, which becomes `WORLD`.
- **Periods.** A `year` column gives annual series and a `day` column gives daily ones. A year before 1 CE can't be stored as a date and raises an error.
- **Blank cells are dropped.** In the wide CSV a blank only means "no value in this column for this row".
- **Titles.** `title_no` is the registry title and `title_en` is OWID's `titleShort`. A chart with several numeric columns uses OWID's `titleLong` to tell them apart, in both titles.
- **`unit`** is OWID's `unit`, in English. `unit_mult` is 0.
- **`licence`** is the list of upstream licence names OWID records for the indicator, in order and without repeats, joined by "; ". If OWID records none, `licence` is empty and `riksdata validate` fails rather than us guessing one.
- **`publish`** is the registry value, forced to false if OWID flags the indicator as `nonRedistributable`.
- **`source_updated`** is the column's `lastUpdated` date. `update` skips a chart whose date hasn't changed.

## Licences

OWID's FAQ says: data produced by OWID, including data marked "with major processing by Our World in Data", falls under its CC BY licence. Other data is "subject to the license terms of those providers", and readers should check those before republishing.

So a blanket `CC-BY-4.0` would be wrong for several charts. This is what OWID recorded on 2026-10-03:

| Chart | Upstream licences recorded by OWID | OWID processing |
|---|---|---|
| `life-expectancy` | CC BY 4.0; CC BY 3.0 IGO; CC0 1.0 Universal; JSTOR terms | major |
| `co-emissions-per-capita` | CC BY 4.0 | major |
| `share-of-individuals-using-the-internet` | CC BY 4.0 | major |
| `daily-per-capita-caloric-supply` | CC BY-NC-SA 3.0 IGO (FAO); © of five publishers for the historical estimates; Public Domain | major |
| `gdp-per-capita-worldbank` | CC BY 4.0 | minor |
| `homicide-rate-unodc` | © United Nations; CC BY 3.0 IGO; CC BY 4.0 | minor |
| `military-spending-as-a-share-of-gdp-sipri` | SIPRI Terms and Conditions | minor |
| `children-per-woman-un` | CC BY 3.0 IGO | not stated |
| `median-age` (both series) | CC BY 3.0 IGO | not stated |
| `child-mortality` | Copyright © UNICEF; CC BY 4.0 | not stated |

None of the ten is flagged `nonRedistributable`, so all have `publish = true` today. Nothing is exported to the site in Phase 1. **Open decision before the first site export:** whether the charts with provider terms that aren't a Creative Commons licence (SIPRI, UNODC, UNICEF, and the FAO non-commercial share-alike licence) should be set to `publish: false` in the registry until the provider's terms have been read.

## Quirks and gotchas

- **CSV headers are lower case** (`entity,code,year`) when `useColumnShortNames=true`. OWID's documentation shows them capitalised. The adapter lower-cases the first three.
- **Always use `csvType=full`.** With `csvType=filtered`, a chart whose default view is the map returns every country for a single year, with values carried forward from earlier years and an extra `<name>__original_year` column. The full CSV has only real observation years.
- **Licence names are stored as OWID writes them**, including one glitch: `child-mortality` has an origin whose licence name is "CC BY 4.0# License (same as origin.license, for backwards compatibility)".
- **Long history.** `daily-per-capita-caloric-supply` starts in 1274 for the United Kingdom, and `life-expectancy` in 1543.
- **Not every entity is in every chart.** `military-spending-as-a-share-of-gdp-sipri` has no `WORLD` row.
- **Lag.** Several charts end in 2023, so `validate` warns that they look stale. That is how often the upstream source is updated, not a fault in the pipeline.

## Datasets

| Chart slug | Norwegian title | Unit | Span (our entities) | Series |
|---|---|---|---|---|
| `life-expectancy` | Forventet levealder ved fødsel | years | 1543–2023 | 1 |
| `co-emissions-per-capita` | CO₂-utslipp per innbygger | tonnes per person | 1750–2024 | 1 |
| `children-per-woman-un` | Samlet fruktbarhetstall (barn per kvinne) | live births per woman | 1950–2023 | 1 |
| `homicide-rate-unodc` | Drap per 100 000 innbyggere | homicides per 100,000 population | 1990–2024 | 1 |
| `military-spending-as-a-share-of-gdp-sipri` | Militærutgifter som andel av BNP | % of GDP | 1949–2025 | 1 |
| `median-age` | Medianalder | years | 1950–2023, projection 2024–2100 | 2 |
| `share-of-individuals-using-the-internet` | Andel av befolkningen som bruker internett | % of population | 1990–2025 | 1 |
| `child-mortality` | Barnedødelighet (under fem år) | deaths per 100 live births | 1751–2024 | 1 |
| `gdp-per-capita-worldbank` | BNP per innbygger (kjøpekraftsjustert) | international-$ in 2021 prices | 1990–2025 | 1 |
| `daily-per-capita-caloric-supply` | Daglig kaloritilførsel per person | kilocalories per day | 1274–2023 | 1 |

Entities for every chart: NOR, SWE, DNK, FIN, ISL, DEU, GBR, USA and the world.

## Fixtures

The files in `tests/fixtures/owid/` were recorded from the live API on 2026-10-03. The CSVs are trimmed to a few entities and years, and the indicator files have their `dimensions` key removed. The exact commands are in `tests/fixtures/README.md`.
