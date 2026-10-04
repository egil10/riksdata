# Source inventory

What data could Riksdata have? On 2026-10-03 every row of `SOURCES.md` was tested from Egil's Mac, past the question of whether it answers: where the data sits, in what form, how much of it there is, and what stands between us and it. This page is the summary. It is a snapshot of that day.

The facts per row are in two places. `registry/source_checks.yaml` holds the request sent to each source and its access class. `lake/source_checks/latest.json` holds what came back. `SOURCES.md` remains the description of each source.

Nothing here is ingestion. Each source got one or a few small requests, paced at one every two seconds per host, with our own User-Agent and no keys.

## The short version

- **316 rows were tested**: the 309 in `SOURCES.md` sections 1 to 20, and 7 candidates found along the way (now section 23).
- **194 rows hand out data through an API or a file at a stable address. 174 of them answered** with data or with the structure of the data. Of the other 20, 14 want a free key, 4 refuse our User-Agent, 1 refuses the connection and 1 shows only its developer portal.
- **28 rows publish numbers on web pages**: files whose addresses change, or tables in HTML. For 21 of them the check found the links it expected.
- **25 rows are documents**, 23 can only be used by hand, and for 22 no data route has been found.
- **Of the 117 priority A rows, 91 can be built against today.**
- The publishers' catalogues hold far more than the rows name: about 3,750 SSB tables, 7,561 Eurostat datasets, 1,548 OECD dataflows, 29,544 World Bank indicators, 374 FHI tables and 461,000 municipal variables at Sikt.

| Access | Rows | ok | reachable | needs key | blocked | unreachable | skipped |
|---|---|---|---|---|---|---|---|
| api | 159 | 141 | 1 | 14 | 2 | 1 | 0 |
| file | 35 | 33 | 0 | 0 | 2 | 0 | 0 |
| page | 28 | 21 | 6 | 0 | 1 | 0 | 0 |
| docs | 25 | 4 | 19 | 0 | 2 | 0 | 0 |
| manual | 23 | 0 | 17 | 0 | 2 | 0 | 4 |
| unknown | 22 | 0 | 20 | 0 | 1 | 1 | 0 |
| none | 24 | 0 | 0 | 0 | 0 | 0 | 24 |
| **Total** | **316** | **199** | **63** | **14** | **10** | **2** | **28** |

The access classes say how a source hands out its data, which decides what kind of adapter it needs:

| Access | Meaning |
|---|---|
| `api` | A queryable API: REST, SDMX, PxWeb, GraphQL, ArcGIS and so on |
| `file` | A file at a stable address: CSV, Excel, ZIP and so on |
| `page` | Numbers on web pages: files whose addresses change, or HTML tables. The adapter has to find the links first |
| `docs` | Text documents (PDF or HTML): reports, rulings, programmes. They give text and events, not series |
| `manual` | Only through an interactive tool (Power BI, Qlik, Shiny), a login or an order form |
| `unknown` | The source answers, but no data route was found |
| `none` | No source of its own: derived metrics and never-use rows |

A class comes from what answered on 2026-10-03. Where a row wasn't dug into, it comes from the row's description in `SOURCES.md`. For `api` rows, `ok` means the endpoint returned data or, for 31 of the OECD and IMF rows, the definition of the dataflow. See "The OECD and IMF rows" below.

## What the publishers' catalogues hold

Counted from each publisher's own list of datasets.

| Publisher | In the catalogue | Notes |
|---|---|---|
| SSB Statbank | 3,753 active tables (7,795 with discontinued ones) | Searchable with `riksdata catalog ssb` |
| Sikt Kommunedatabasen | 461,259 variables in 249 subjects and 12 groups, 1769 to 2026 | One variable is one measure for one year across municipalities. Population 127,000, labour 124,000, education 53,000, elections 13,000. The 250th subject (municipal accounts) would not load |
| World Bank | 29,544 indicators in 71 databases | 1,498 are in WDI, 8,308 in Education Statistics |
| Eurostat | 7,561 datasets and tables | The table of contents gives first and last period and the number of values for each |
| WHO GHO | 3,099 indicators | NC licence, so `publish: false` |
| OECD | 1,548 dataflows | Includes flows the rows don't name: Trust Survey, waiting times, fossil fuel support for Norway, regional house prices. No dataflow has PISA in its name |
| ILOSTAT | 1,213 indicators (1,964 with frequency variants) | The list gives first and last period and the number of records |
| UN SDG | 713 series | |
| FHI statistikk | 374 tables in 13 registries | Folkehelsestatistikk 119, MFR 94, NPR 59, DÅR 26, SYSVAK 14, ABR 13, wholesale drug statistics 11, genome surveillance 11, MSIS 10, LMR 7, HKR 5, KPR 3, pest statistics 2 |
| IMF | 223 dataflows, plus 132 DataMapper indicators | The dataflows include dated WEO and Fiscal Monitor vintages |
| SSB Klass | 152 classifications | |
| DBH (HK-dir) | 110 tables | 23 data tables, 33 lists, 34 code tables, 16 retired, 4 views |
| ECB | 105 dataflows | |
| BIS | 29 dataflows | |
| Norges Bank | 24 dataflows | |
| Udir statistikkbanken API | 8 tables | All eight are Elevundersøkelsen |
| Sodir FactMaps | 39 map layers and 73 tables | |
| Kystdatahuset | 130 API paths | |
| data.norge.no | 9,144 dataset entries, 1,075 API entries | 1,645 datasets are flagged as open, from 110 publishers |
| Geonorge | 8,897 entries, of which 7,403 datasets | 4,369 are aerial photos and 1,957 elevation data |
| regjeringen.no | 80,552 pages in the sitemap | 29,617 documents, 12,584 EØS notes, 383 budget pages |

Stortinget has no dataset list, but every export endpoint answered. For the session 2025–2026 it returned 663 cases, 3,927 written questions (7.9 MB in one response), 524 question-time questions, 351 hearings, 155 meetings, 111 referat, 325 Dokument 8 proposals and 474 innstillinger. valgresultat.no answered for every election year from 2009 to 2025; 2005 and 2007 give 404.

## What it takes to fetch it

The 194 `api` and `file` rows, grouped by the adapter that would serve them.

| Adapter family | Rows | Answered | What it covers |
|---|---|---|---|
| SDMX | 38 | 38 | OECD (24 rows), IMF (11), BIS, ECB, Norges Bank. One generic adapter. The OECD rate limit is tight (see below); IMF is slow |
| PxWeb | 22 | 22 | SSB (20 rows; the adapter exists), plus Oslo kommune and Nordic Statistics, which run the same software |
| Files at stable addresses | 32 | 30 | DFØ statsregnskap, Mattilsynet, Fiskeridirektoratet, Innovasjon Norge, Forskningsrådet, CORDIS, WID, the text corpora and several rankings. One registry-driven adapter for CSV would cover most. ParlGov and OpenTender refuse our User-Agent |
| REST APIs of their own | 82 | 64 | One small adapter each: Stortinget, valgresultat, Brreg, NVE, Kartverket, Udir, DBH, Kommunedatabasen, eInnsyn and so on. 14 need keys |
| Eurostat (JSON-stat) | 6 | 6 | One adapter |
| World Bank | 2 | 2 | One adapter (WDI and WGI) |
| FHI statistikk (JSON-stat2) | 2 | 2 | One adapter for 13 registries |
| GraphQL | 3 | 3 | Entur, Trafikkdata, Atlas of Economic Complexity |
| Dataverse | 3 | 3 | Penn World Table, UN votes, Global Party Survey |
| ArcGIS REST | 2 | 2 | Sodir FactMaps, Miljødirektoratet |
| OWID | 2 | 2 | The adapter exists |

About 20 rows deliver Excel or ODS workbooks (NAV, regjeringen.no, Partifinansiering, Havbruksfondet, EU ETS, Norges Bank's historical statistics and others). Polars needs an extra package to read those. See "For Egil" below.

## Priority A

91 of the 117 priority A rows answered through an API or a stable file. The other 26:

| Why not yet | Rows |
|---|---|
| Need a free key (3) | NBIM voting records, Helsedirektoratet NKI, ENTSO-E. MARPOR also needs a key for its data; only its version list is open |
| Refuses our User-Agent (1) | ECHR HUDOC |
| Files behind a page (8) | regjeringen.no budget figures, Grønt hefte, NAV statistics, valg.no candidate lists, Partifinansiering, EU ETS, Havbruksfondet: all confirmed down to the files. EEA-Lex: HTML pages only |
| Documents (6) | Statens eierrapport, SIFO referansebudsjett, party programmes, government platforms, Riksrevisjonen, IMF Article IV |
| By hand only (4) | Finansdepartementet's budget answers, hospital waiting times, GP statistics, Udir Statistikkportalen |
| No route found (1) | Miljødirektoratet's municipal greenhouse-gas figures |
| Derived metrics (3) | Computed from Stortinget data, no source of their own |

## Findings by area

### Government documents (regjeringen.no)

- regjeringen.no answers from the Mac on every row. Its `robots.txt` disallows `/api/` and every filtered list (`?documenttype`, `?topic`, `?from` and so on). The sitemap is the allowed index: 80,552 pages in two files of 15 MB together.
- **Budget figures exist as workbooks.** Every budget year from 2000 to 2027 has a page. The Gul bok figures for 2026 are one workbook of 158 KB, and the sitemap has the same kind of page for 2024 and 2025. "Tallene bak figurene" pages for the national budget and the revised budget exist for most years from 2007 to 2026, and for Prop. 1 LS in 2026.
- **Finansdepartementet's answers to budget questions have no route for us.** They sit behind a search page that loads from `/no/api/`, which robots.txt disallows. Asking the ministry for the list is the way.
- Grønt hefte links to 239 ODS tables, 16 to 18 per year for 2019 to 2026. Karantenenemnda's page links to all 340 decisions as PDFs. Statens eierrapport is a PDF only (22.6 MB for 2025).
- New: **EØS-notatbasen**, 12,500 notes from 2004 to 2026 on EU acts considered for the EEA Agreement.

### Welfare and labour

- NAV has 64 statistics pages that link to 260 data files (212 xlsx, 38 xls, 10 csv) and 284 PDFs. The CSVs cover unemployment by municipality and month, seasonally adjusted series back to 1951, and disability benefit. Everything else is Excel. The addresses change every month, so each run has to read the pages first.
- Arbeidstilsynet's registers refuse our User-Agent.

### Politics and elections

- Stortinget, valgresultat.no, Kommunedatabasen, Partiregisteret, Lovdata and Wikidata all answer.
- **Kommunedatabasen has a documented API** (`/api`): groups, subjects, variables, data, and recalculation of old figures to a chosen year's municipal borders. The request for the variables of subject 46 (municipal accounts) timed out, and the next 17 requests got 503 or 504. A later retry of subject 46 gave 502. An adapter should not ask for that list in one go.
- Partifinansiering links to one workbook per year from 2006 to 2025 (0.8 MB each for 2024 and 2025). Sikt's party-document archive is one ZIP of 347 MB. Lovdata's Lovtidend archive is 69 MB.
- Polls: PolitPro needs a token. pollofpolls stays link-only.

### Accountability and courts

- Mostly documents. Sivilombudet's site has a WordPress API. Mattilsynet's inspection file (17 MB) was last changed on the day of the check.
- HUDOC and ParlGov answer 403 to our User-Agent. Both answered the catalogue's check from the server.

### Health

- FHI's API answers for all 13 registries.
- **Hospital waiting times and GP statistics are Power BI reports only**, at FHI and Helsedirektoratet. FHI's open NPR tables hold activity counts, not waiting times. The route to waiting times is Helsedirektoratet's NKI API, which needs a key.
- Kreftregisteret and the quality registers are interactive apps.

### Education

- Udir's open API has eight tables, all from Elevundersøkelsen. **Statistikkportalen (grades, national tests, GSI) is a JavaScript app whose `robots.txt` disallows everything**, so those numbers need an agreement with Udir or manual exports.
- The school and kindergarten registers answer (18,358 and 16,233 units). The Barnehagefakta API answers at `barnehagefakta.no/api/`. Udir links to 32 CSV files of item-level national test data.
- **The DBH API works.** Its address is `dbh-data.dataporten-api.no/Tabeller/`: `/All` lists the tables, and a query needs `groupBy` and at least one filter. Table 379 has applicant numbers; the old Samordna opptak address for them gives 404.

### Energy and environment

- NVE, Statnett, Elhub, hvakosterstrommen and Sodir answer. ENTSO-E needs its token.
- **EU ETS figures are files on the Commission's site**: about 165 workbooks and ZIPs with verified emissions and compliance per year.
- Miljødirektoratet's municipal greenhouse-gas page is a JavaScript app; no file address was found. data.norge.no lists Enova's energy-label data at `data.enova.no`, which is also an app.
- MET Frost, NILU and BarentsWatch need keys. New: **Mattilsynet's akvakultur API gives weekly sea-lice reports without a key.**

### Transport and geography

- NVDB, Trafikkdata, Entur, Kystdatahuset, Avinor, Bysykkel and Kartverket answer. Entur's national GTFS file is 609 MB.
- SSB's population grid downloads through a Geonorge ATOM feed per year and grid size. The WFS address in its catalogue entry no longer resolves.

### Business and primary industries

- Brreg (three registers), Innovasjon Norge (17.8 MB), Forskningsrådet, CORDIS, NVA, Fiskeridirektoratet, Akvakulturregisteret and Landbruksdirektoratet answer. Havbruksfondet's workbooks are linked from its page.
- Several of these hold private persons (`pii: true` in the check list). The pipeline has no rule for them yet, so they wait for that.

### International

- OECD, IMF, Eurostat, World Bank, BIS, ILO, WHO and the UN answer. The ECB answered slowly: one time-out and one 504 before it succeeded.
- Rankings: Transparency International, RSF and UNDP are files at stable addresses. QoG, CPDS, CHES, the World Happiness Report and SIPRI's military expenditure are files linked from a page. Penn World Table downloads from DataverseNL.
- The pages on www.oecd.org and www.imf.org refuse our User-Agent. Their data APIs don't.

## The OECD and IMF rows

For 21 OECD rows and 10 IMF rows the check asks for the definition of the dataflow, not for data, to stay inside the publishers' limits. To see whether Norway is in them, a one-off test asked each of the 21 OECD dataflows for Norway's latest observation. It got through ten:

| Dataflow | Result |
|---|---|
| `DF_REVNOR`, Norway's tax revenues | 337 series, latest 2024 |
| `DF_SSCPTOECD` | 770 series, latest 2024 |
| `DF_TW_COMP`, Taxing Wages | More than 1,077 series (the sample was cut at 400 KB), latest 2025 |
| `DF_METR`, TaxBEN | More than 936 series, latest 2025 |
| `DSD_SOCX_AGG@DF_NET_GDP`, net social spending | 39 series, latest 2021 |
| `DF_PMR` | 47 series, latest 2023 |
| `DF_LMP`, `DF_WEALTH`, `DF_HSL_CWB` | No rows for the key the test built. The catalogue's own checks got data from the first two, so the key was wrong; the data isn't missing |
| `DF_GOV_2025` | The API answered with an internal error for this dataflow |
| The other 11 | Not asked |

**Then the OECD API answered 429.** It came on the test's 22nd request, 42 seconds in, which was the 49th request to the API in about 40 minutes, structure and data requests counted together. Once it had tripped, structure requests were refused too. The test sent nine more requests before it ended, which it should not have done. Two things follow:

- An OECD adapter must count every request against the limit (60 an hour according to `SOURCES.md`), structure calls included, and space them out.
- `check-sources` now stops asking a host for the rest of the run once it answers 429. A full run sends 24 requests to the OECD API, so don't run it more than about twice an hour.

One IMF trial (Fiscal Monitor with a country filter) returned the list of indicators without values, so that request form needs work. The 10 IMF rows are still checked for structure only. IMF WEO and DataMapper returned Norway's values.

## Sizes worth knowing

| Download | Size | Last changed |
|---|---|---|
| CEPII BACI (one HS revision) | 2,418 MB | 2026-01-22 |
| WID.world, all countries | 882 MB | 2026-09-09 |
| Entur national GTFS | 609 MB | 2026-10-03 |
| Sikt party-document archive | 347 MB | 2025-07-08 |
| ParlaMint-NO | 222 MB | 2023-03-17 |
| Lovdata Lovtidend 2001–2025 | 69 MB | |
| Fiskeridirektoratet landings 2025 | 48 MB | 2026-10-03 |
| CORDIS Horizon projects | 37 MB | 2026-09-22 |
| Innovasjon Norge grants | 17.8 MB | 2026-10-02 |
| Mattilsynet inspections | 17.2 MB | 2026-10-03 |
| Fartøyregisteret | 10.1 MB | 2026-10-03 |
| DFØ statsregnskap, one year | about 4 MB | |

`check-sources` now records the size the server states for each response (`total_bytes`) and its `Last-Modified` date, so the size of a file it requests shows up without downloading it. BACI, the GTFS file and the Lovtidend archive are not check addresses and were measured separately.

## Corrections to SOURCES.md

These add to the list in [Source checks](source-checks.md).

- **Helsedirektoratet ventetider, SAMDATA and Fastlegestatistikk** are Power BI reports, not Excel or CSV files.
- **Udir Statistikkportalen**: `robots.txt` disallows everything.
- **regjeringen.no**: `robots.txt` disallows `/api/` and filtered lists. The budget answers exist only behind that API.
- **DBH**: the API's address is `https://dbh-data.dataporten-api.no/Tabeller/`.
- **Barnehagefakta**: the API is at `https://www.barnehagefakta.no/api/`.
- **OECD Trust Survey**: it has dataflows (`DSD_GOV_TDG_SPS_GPC@DF_GOV_TDG_2023` and two more). PISA has none.
- **World Bank**: 29,544 indicators, not about 16,000. WDI has 1,498.
- **Penn World Table**: the files download from DataverseNL from the Mac. Licence CC BY 4.0.
- **EU ETS**: the files are on `climate.ec.europa.eu`, not on the Union Registry site.
- **Energimerkeregisteret**: Enova's data portal is `data.enova.no`.
- **SSB befolkning på rutenett**: data.norge.no states NLOD 1.0, not CC BY 4.0. The WFS address `ogc.ssb.no` doesn't resolve.
- **Party Facts**: CSV at `https://partyfacts.herokuapp.com/download/core-parties-csv/`. **CHES**: files on GitHub releases.
- **Appendix A2**: the Vegvesen address for kjøretøyopplysninger gives 404, and MET Frost's credentials page gives 400 to our request. The other 15 sign-up pages answer.
- **data.norge.no entries are often stale.** Of 24 looked up, the download address was dead for DFØ's Doffin notices, IMDi's statistics and the police staffing workbook, and the crude-oil norm prices end in 2019.

## For Egil

1. **Keys.** 16 sources need a free key: the 14 in the table above, plus MARPOR and Patentstyret for their data. ENTSO-E, Helsedirektoratet and NBIM voting are priority A. The sign-up addresses are in `SOURCES.md` A2.
2. **An Excel reader.** About 20 rows deliver xlsx, xls or ODS. Polars reads them with the `fastexcel` package, which isn't a dependency yet. JST Macrohistory's address serves only a Stata file, which would need another package; CHES and Penn World Table also come as CSV or Excel. The 25 document rows will later need a PDF text extractor.
3. **Hosts that refuse our User-Agent**: HUDOC, ParlGov, Arbeidstilsynet, OpenTender, Vannmiljø, and the pages on www.oecd.org and www.imf.org. Whether to send a browser-like one is still open.
4. **Two requests worth sending**: to Finansdepartementet for the budget answers as a list or file, and to Udir for an export from Statistikkportalen.
5. **Section 23** of `SOURCES.md` has the seven candidates. Whether they belong in the catalogue is a call for the catalogue's owner.

## A possible order for ingestion

1. **SDMX, World Bank and Eurostat adapters.** Three adapters reach 46 rows and the largest catalogues.
2. **More PxWeb**: the 200 SSB shortlist tables through the existing adapter, then Oslo and FHI.
3. **Stortinget and valgresultat.no**, the base of the politics universe.
4. **A file adapter driven by the registry** for CSV at stable addresses, starting with sources without private persons (DFØ, NBIM, Norges Bank, rankings).
5. **Small REST adapters by universe**: energy (NVE, Statnett, Elhub, hvakosterstrommen), then Brreg, Kartverket and Udir.
6. **Pages with workbooks** (NAV, budget figures, Partifinansiering) once an Excel reader is in.
7. **Person-level registers and documents** after the privacy rule and a text pipeline exist.

## Reproduce

```bash
uv run riksdata check-sources                  # all 316 rows, about five minutes
uv run riksdata check-sources --section 23     # the candidates
```

The command prints the status table and the access table above. The catalogue counts and the page-by-page findings came from one-off requests made the same day; they are not part of a command yet.
