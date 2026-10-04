# SSB (Statistics Norway): Statbank via PxWeb API v2

| | |
|---|---|
| Adapter | `py/riksdata/adapters/ssb.py` |
| Registry | `ssb` in `registry/sources.yaml`, datasets in `registry/datasets/ssb.yaml` |
| Base URL | `https://data.ssb.no/api/pxwebapi/v2` |
| Auth | None |
| Limits | 40 calls per 60 s per IP (response header `x-ratelimit-policy: 40;w=60s`). We cap ourselves at 35 per 60 s. 800,000 cells per data request (`maxDataCells` in `/config`) |
| Licence | CC BY 4.0, <https://www.ssb.no/en/diverse/lisens> (checked 2026-10-03) |
| Attribution | "Kilde: Statistisk sentralbyrå". Each series' `citation` is "Kilde: Statistisk sentralbyrå, tabell 14710" |

The old `api/v0/dataset/...` URLs that v1 used now return 410 Gone. Nothing here uses v0.

## Endpoints used

| Call | Used for |
|---|---|
| `GET /tables?lang=no&pageSize=10000` and the same with `lang=en` | The whole catalogue, one call per language: 3,753 active tables, or 7,795 with `includeDiscontinued=true` |
| `GET /tables/{id}?lang=en` | Staleness probe (`updated`) and the `discontinued` flag |
| `GET /tables/{id}/metadata?lang=en` | English labels for `title_en`, and a check of the registry selection against the table |
| `GET /tables/{id}/data?lang=no&outputFormat=json-stat2&valueCodes[Dim]=a,b` | The data, with Norwegian labels and units |

One `update` costs three calls per table. `riksdata catalog ssb --refresh` costs two.

## How a table becomes series

- **`select`** lists the value codes for every dimension of the table and is sent as `valueCodes[...]`. Non-time dimensions use explicit codes; only the time dimension (`Tid`) may use `"*"` or another expression, and the adapter refuses anything else. New periods arrive on their own, while the set of series stays pinned in the registry.
- **`series_key`** names the non-time dimensions that define a series. We list all of them, in table order, even when only one value is selected. That keeps series ids stable if a selection is widened later.
- **`series_id`** is `ssb.<table>.<key>`, where the key is the `series_key` codes in lower case joined by `_`. Characters other than `a-z`, `0-9` and `-` become `_`. Example: `ssb.13760.0_15-74_s_arbledprosarbstyrk`.
- **`dims`** is a JSON object with every non-time dimension code, for example `{"Kjonn": "0", "Alder": "15-74", "Justering": "S", "ContentsCode": "ArbledProsArbstyrk"}`.
- **Titles** are the registry title, then the labels of the dimensions that vary within the dataset: "Offentlig forvaltnings utgifter etter formål: Helse". Norwegian labels come from the data response and English ones from the metadata call. SSB marks sub-categories with a leading "¬ " (table 08484: "¬ Eiendomstyveri"); the adapter strips it.
- **`unit`** is the unit SSB publishes for the content code, in Norwegian and including any multiplier ("mill. kr", "1000 personer"). `unit_mult` is 0 because the value is already in that unit.
- **Periods**: `2026M08` becomes `2026-08`, `2026K2` becomes `2026-Q2`, and `2026` stays `2026`. The registry `frequency` must match what the data contains.
- **`entity_id`** is the dataset's `entity` (`NOR` for all current tables). Regional tables aren't supported yet.
- **Missing cells are kept.** A cell without a value is stored with `value` null and SSB's flag in `status`. `first_period` and `last_period` only count periods that have a value.
- **`tag`** is `DATA`. `source_updated` is the `updated` timestamp in the data response.

## Quirks and gotchas

- **Always select every dimension.** If a mandatory dimension is left out, SSB answers 400 "Missing selection for mandantory variable". If an optional one is left out, SSB aggregates over it without saying so. The adapter refuses a `select` that doesn't name every dimension, and checks explicit codes against the metadata before asking for data.
- **Quote ids and codes made of digits in YAML.** An unquoted `14710` is a number, and `07321` would be read as octal 3793. The registry loader rejects unquoted ids and codes.
- **Tables get closed and replaced.** The CPI table 03013 was closed when the index was rebased to 2025=100 (now 14710). A closed table has `"discontinued": true` in `/tables/{id}`. `update` then logs a warning in capitals and repeats it under the summary table. Set `superseded_by` and add the replacement.
- **Zeros that mean "not available".** Table 05803 publishes `0` with no status flag for marriages (`InngEkteskap`) and divorces (`Skilsmisse`) in 2021, 2022, 2023 and 2025, while 2024 has real figures (21,136 marriages). Those are missing figures, not real zeros, so the registry leaves the two contents out. `validate` warns about any series with a 0 between other values (`suspicious_zeros`), which is how the next case will show up. A table whose zeros are real figures sets `real_zeros: true` in the registry, with the reason in a comment, and is left out of that check.
- **Status flags are stored as published.** Seen so far: `..` (not available) and `*` (preliminary, on 2023 and 2024 in table 09842).
- **Table 07391 is accumulated through the year.** Each month is the year-to-date total, so December is the annual figure. The two petroleum taxes are 0 in January 2017 and January 2026, which are real figures, so the table has `real_zeros: true`. Its labels are in Nynorsk, and one has a stray tab that the adapter trims.
- **Table 12439 has a break between 2014 and 2015** (new data source). SSB says only the seasonally and influenza adjusted series is comparable across it, which is why we fetch that series alongside the seasonally adjusted one.
- **Table 13760:** SSB recommends the trend or the three-month average over the monthly seasonally adjusted figures, which are volatile. We fetch the seasonally adjusted figures (`Justering: S`). Adding `T` to the selection adds the trend.
- **Table 09842 looks stale.** It was last updated on 2025-06-20 and ends in 2024. It isn't marked as discontinued, and the catalogue has no other per-capita table for the national accounts.
- **Table 08484 has codes that differ only in case.** `1AAAAA-9ZZZZz` is "all groups of offences" and `1AAAAA-9ZZZZZ` is "all types of offences" in an older classification. Series ids are lower case, so selecting both would collide; the adapter refuses that. We select the groups.
- **Table 13151 has a row only in election years**, so its two series look stale between elections.
- **Table 06035** (price per square metre), which the catalogue names, is discontinued.
- **Skipped updates.** `update` skips a table when SSB's `updated` timestamp and our registry entry are both unchanged. After changing the adapter code, run `update --force`.

## Datasets

| Table | Slug | What | Selection | Series |
|---|---|---|---|---|
| 14710 | `kpi` | Consumer price index (2025=100), monthly from 1920 | The table's only content, `KpiIndMnd` | 1 |
| 13760 | `aku` | Labour force survey, monthly from 2006 | Both sexes, ages 15–74, seasonally adjusted: labour force, employed, unemployment rate | 3 |
| 05803 | `befolkning` | Population 1 January and changes during the year, from 1735 | 12 of the 14 contents: marriages and divorces are left out (see quirks) | 12 |
| 14669 | `offentlige-utgifter` | General government expenditure by function, from 1995 | General government, total expenditure, all functions plus the ten COFOG divisions | 11 |
| 07391 | `skatt` | Taxes paid by type, accumulated monthly, from 2008 | All arrangements, total plus the nine tax types | 10 |
| 12439 | `sykefravaer` | Sickness absence for employees, quarterly from 2000 | Three sexes by three certification types, two adjusted rates | 18 |
| 09842 | `bnp-per-innbygger` | GDP and main aggregates per capita, from 1970 | All 6 contents | 6 |
| 10318 | `formuesfordeling` | Share of total net wealth, 2010–2024 | The ten deciles and the top 5, 1 and 0.1 per cent | 13 |
| 08815 | `formuesskatt` | Taxable wealth, debt and wealth tax, from 1999 | Gross wealth, debt, net wealth, wealth tax: amount and persons, residents 17+ | 8 |
| 13151 | `valgdeltakelse` | Electoral turnout, from 1829 | Storting elections and local elections, both sexes | 2 |
| 07221 | `boligpriser` | Price index for existing dwellings, quarterly from 1992 | Whole country, all dwelling types, with and without seasonal adjustment | 2 |
| 09695 | `konkurser` | Bankruptcies, monthly from 1980 | The table's only content | 1 |
| 08484 | `anmeldte-lovbrudd` | Offences reported per 1,000 population, from 1993 | All groups and the nine groups of offence | 10 |

## Fixtures

The files in `tests/fixtures/ssb/` are responses from the live API, recorded on 2026-10-03 with narrow selections. The only edit is that SSB staff contact details are removed. The exact commands are in `tests/fixtures/README.md`.
