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

One `update` costs three calls per chart (four for a chart with two numeric columns). The 15 charts take 47 calls, so a full run takes about a minute and a half with our cap.

## How a chart becomes series

- **One series per numeric column.** The id is `owid.<slug>` when the chart has one numeric column, otherwise `owid.<slug>.<short_name>`. Columns that aren't numeric are annotations and are skipped, for example `owid_region` (type `Continent`).
- **Projections are estimates, not data.** OWID marks a projection column with the suffix `__projected` in the CSV (the metadata key has no suffix). Such a series gets `tag = ESTIMATE` and `estimate_by = publisher`. Today that is the UN medium-scenario series in `median-age`, which runs to 2100.
- **Entities** are filtered to the registry's `entities` after download. `entity_id` is the ISO3 `code`, except `OWID_WRL`, which becomes `WORLD`.
- **Periods.** A `year` column gives annual series and a `day` column gives daily ones. A year before 1 CE can't be stored as a date and raises an error.
- **Blank cells are dropped.** In the wide CSV a blank only means "no value in this column for this row".
- **Titles.** `title_no` is the registry title and `title_en` is OWID's `titleShort`. A chart with several numeric columns uses OWID's `titleLong` to tell them apart, in both titles.
- **`unit`** is OWID's `unit`, in English. `unit_mult` is 0.
- **`licence`** is the list of upstream licence names OWID records for the indicator, in order and without repeats, joined by "; ". A name that holds several licences is split on ";", and a stray "# comment" after a name is cut. If OWID records none, `licence` is empty and `riksdata validate` fails rather than us guessing one.
- **`publish`** is the registry value, forced to false if OWID flags the indicator as `nonRedistributable`.
- **`source_updated`** is the column's `lastUpdated` date. `update` skips a chart whose date hasn't changed.

## Licences

OWID's FAQ says: data produced by OWID, including data marked "with major processing by Our World in Data", falls under its CC BY licence. Other data is "subject to the license terms of those providers", and readers should check those before republishing.

So a blanket `CC-BY-4.0` would be wrong for several charts. Each series carries the upstream licences OWID records. This is what they were on 2026-10-03:

| Chart | Upstream licences recorded by OWID | Terms note |
|---|---|---|
| `co-emissions-per-capita` | CC BY 4.0 | |
| `gdp-per-capita-worldbank` | CC BY 4.0 | |
| `gdp-per-capita-maddison-project-database` | CC BY 4.0 | |
| `share-of-individuals-using-the-internet` | CC BY 4.0 | |
| `total-tax-revenues-gdp` | CC BY 4.0 | |
| `children-per-woman-un` | CC BY 3.0 IGO | |
| `median-age` (both series) | CC BY 3.0 IGO | |
| `life-expectancy` | CC BY 4.0; CC BY 3.0 IGO; CC0 1.0 Universal; JSTOR terms | yes |
| `annual-working-hours-per-worker` | CC BY 4.0; © 2005 Huberman and Minns | yes |
| `share-of-electricity-production-from-renewable-sources` | CC BY 4.0; © Energy Institute 2026; Open Government Licence v3.0 | yes |
| `child-mortality` | Copyright © UNICEF; CC BY 4.0 | yes |
| `homicide-rate-unodc` | © United Nations; CC BY 3.0 IGO; CC BY 4.0 | yes |
| `military-spending-as-a-share-of-gdp-sipri` | SIPRI Terms and Conditions | yes |
| `oil-production-by-country` | © Energy Institute 2026; CC BY-SA 3.0; Public domain | yes |
| `daily-per-capita-caloric-supply` | CC BY-NC-SA 3.0 IGO (FAO); © notices on seven publications from five publishers, for the historical estimates; Public Domain | yes |

None of the 15 is flagged `nonRedistributable` by OWID, and all 15 are published.

**The rule.** `riksdata validate` has a list of open licences: CC BY 4.0, CC BY 3.0 IGO, CC0 1.0, Public Domain, NLOD 2.0 and Open Government Licence v3.0. A published series whose licence has any other part fails the `licence_terms` check unless its dataset has a `terms_note` in the registry. The note is a Norwegian sentence that the site shows under the licence and that follows the series into the CSV download. It records that Egil has decided the terms allow publication.

On 2026-10-03 Egil decided to publish the five charts that had been held back (SIPRI, UNODC, UNICEF, FAO calorie supply, Energy Institute oil) for non-commercial use with attribution. Their notes say so, and the three charts that were already published with a part outside that list among their origins got a note too. Two consequences:

- riksdata.org has to stay non-commercial, with no ads and no paid tier, while these series are shown.
- The share-alike parts (FAO, and one origin of the oil series) mean that anyone who passes those series on must do it under the same licence.

A new chart with a licence part outside the list starts as `publish: false` until Egil has decided.

Three charts named in `SOURCES.md` were not added: `government-spending-share-gdp` does not exist (404), `electric-car-sales-share` has no licence recorded by OWID, and `human-development-index` has no unit, which `validate` requires.

## Quirks and gotchas

- **CSV headers are lower case** (`entity,code,year`) when `useColumnShortNames=true`. OWID's documentation shows them capitalised. The adapter lower-cases the first three.
- **Always use `csvType=full`.** With `csvType=filtered`, a chart whose default view is the map returns every country for a single year, with values carried forward from earlier years and an extra `<name>__original_year` column. The full CSV has only real observation years.
- **Licence names have glitches.** `child-mortality` has an origin whose licence name is "CC BY 4.0# License (same as origin.license, for backwards compatibility)". The adapter cuts each name at the first `#`.
- **Long history.** `daily-per-capita-caloric-supply` starts in 1274 for the United Kingdom, and `life-expectancy` in 1543.
- **Real zeros.** Three charts have a 0 between other values that is a real figure: `co-emissions-per-capita` (Norway 1832–1834), `homicide-rate-unodc` (Iceland 1998, 2006 and 2008) and `oil-production-by-country` (Sweden, which produced oil in only 22 of the years 1950–1986). They set `real_zeros: true` in the registry, so `validate` doesn't warn about them.
- **Not every entity is in every chart.** `military-spending-as-a-share-of-gdp-sipri` has no `WORLD` row.
- **Lag.** Several charts end in 2022 or 2023. `validate` warns about an annual series when its last year ended more than 1,100 days ago. That is how often the upstream source is updated, not a fault in the pipeline.

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
| `gdp-per-capita-maddison-project-database` | BNP per innbygger, lange linjer (Maddison) | international-$ in 2011 prices | 1–2022 | 1 |
| `share-of-electricity-production-from-renewable-sources` | Fornybarandel i kraftproduksjonen | % | 1900–2025 | 1 |
| `total-tax-revenues-gdp` | Skatteinntekter som andel av BNP | % of GDP | 1980–2023 | 1 |
| `annual-working-hours-per-worker` | Årlig arbeidstid per sysselsatt | hours per worker | 1870–2023 | 1 |
| `oil-production-by-country` | Oljeproduksjon | terawatt-hours | 1900–2025 | 1 |

Entities for every chart: NOR, SWE, DNK, FIN, ISL, DEU, GBR, USA and the world.

## Fixtures

The files in `tests/fixtures/owid/` were recorded from the live API on 2026-10-03. The CSVs are trimmed to a few entities and years, and the indicator files have their `dimensions` key removed. The exact commands are in `tests/fixtures/README.md`.
