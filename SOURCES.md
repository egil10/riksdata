# Riksdata — SOURCES: catalogue of data on Norway

> The master list of sources worth integrating, Norwegian and international. It feeds `registry/sources.yaml` (only sources with an adapter go there).
> Live checks run from the box on **2026-10-03**. **Check** column legend:
> **✅** data endpoint verified (returned real data) · **🌐** site/endpoint reachable, data access not verified · **🔑** reachable but needs a key/registration · **❌** blocked/failed from the box (may work from a home IP) · **❓** not checked.
> **Priority:** **A** = core, build early · **B** = valuable, build when its universe is built · **C** = nice-to-have / research / context.
> **Licence:** stated where confirmed; "(verify)" means I believe it but haven't checked the terms page. Re-check before publishing.

Granularity shorthand: **N** national · **F** county · **K** municipality · **G** grid/point/geo · **I** individual/entity (person, firm, vehicle, vote) · **X** cross-country. Frequency: D/W/M/Q/A.

---

## 1. Norwegian statistics, economy and public finance

| Source | What it covers (granularity · freq · history) | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **SSB Statbank (PxWeb API v2)** | ~3,750 active tables (7,795 incl. discontinued): population, labour, prices, national accounts, income/wealth, tax, crime, education, health, energy, environment · N/F/K · D–A · some series to 1735 | API `https://data.ssb.no/api/pxwebapi/v2` (`/tables`, `/tables/{id}/metadata`, `/tables/{id}/data`, json-stat2/csv/**parquet**) | none; 40 calls/60 s; 800k cells/request | CC BY 4.0 | **A** | ✅ | The backbone. Native Parquet output; catalogue in one call |
| SSB **KOSTRA** (in Statbank) | Municipal/county finances and service indicators (schools, care, kindergartens, child welfare) · K/F · A · 2015→ (older varies) | Same API (search "KOSTRA") | none | CC BY 4.0 | **A** | ✅ | Compare municipalities on spending and outcomes. The basis for "Din kommune" and municipal DiD designs |
| SSB **Klass** (classifications) | Municipality/county codes over time, NACE, COFOG, occupations, with crosswalks · versioned | API `https://data.ssb.no/api/klass/v1` | none | CC BY 4.0 | **A** | ❓ | Solves municipality reforms (2020, 2024) and time-valid joins |
| SSB **projections** | Population projections to 2100, by K | Statbank | none | CC BY 4.0 | B | ❓ | Ageing and dependency, tagged ESTIMATE (publisher) |
| **Norges Bank** | Policy rate, FX (daily), government debt, liquidity, Regional Network, NOWA · N · D–Q · FX from 1990s | SDMX API `https://data.norges-bank.no/api/data/{flow}/{key}?format=sdmx-json` | none | NLOD (verify) | **A** | ✅ | Monetary policy and NOK. Pairs with finance research |
| **NBIM** (Government Pension Fund Global) | Fund value, returns, holdings by company/country/sector (annual, since 1998), management costs | Website downloads (Excel/CSV) `https://www.nbim.no/en/investments/all-investments/`; ❓ API | none | Terms (verify) | **A** | 🌐 | "Oljefondet" page. Fund vs. budget transfer (handlingsregelen) |
| **DFØ statsregnskap** | Central-government accounts by kapittel/post/artskonto/agency · M · 2014→ (statsregnskapet.no from 1999) | Bulk zip CSV `https://statsregnskapet.dfo.no/nedlasting/statsregnskapet_aar_YYYY.zip`, `_siste_maaned.zip`, `_hittil_i_aar.zip`, full history (50 MB zip / 1.5 GB); **bevilgningshistorikk** CSV | none | NLOD | **A** | ✅ | Actual spending, not intentions. CSV is `;`, **Windows-1252**, decimal comma, `Periode=YYYYMM` |
| **regjeringen.no**: Prop. 1 S, Gul bok, Prop. 1 LS, Nasjonalbudsjettet, Revidert, NOU, høringer | Proposed budget, tax changes with revenue effects, example tax calculations, white papers, consultations · A | HTML/PDF/Excel on regjeringen.no; statsbudsjettet.no | none | NLOD (verify) | **A** | ❌ (403 from the box, bot protection) | Baseline for party arithmetic. Golden tests for the tax engine. Fetch from Egil's Mac or use DFØ for the numbers |
| **Skatteetaten**: rates and published statistics | Current rates/thresholds, skattekalkulator (manual), aggregate statistics | skatteetaten.no (HTML); developer APIs at skatteetaten.github.io are **for authorised systems only** | n/a | — | B | ❓ | Parameter cross-check for the tax engine (the primary legal source is the Lovtidend skattevedtak) |
| Skatteetaten **skattelister** (public tax lists) | Per-person income/wealth/tax | Login (ID-porten), searches logged and visible to the taxpayer; mass collection prohibited | ID-porten | Restricted | **Do not use** | — | Ethically and legally off-limits for Riksdata. Use SSB distribution tables instead |
| **Finanstilsynet** | Bank/insurance key figures, lending surveys, household debt, Finansielt utsyn | Website (Excel/PDF); ❓ API | none | NLOD (verify) | B | ❓ | Household debt and financial stability context |
| **Oslo Børs / Euronext** | Index levels, prices, turnover | Euronext site downloads (licensed data; redistribution restricted); v1 used Yahoo | — | **Proprietary** | B | ❓ | Event studies (research). Don't republish raw prices. Show derived/aggregated data only, or link out |
| **Statistisk sentralbyrå: Statistikk om partifinansiering** | Party income statistics | Statbank (verify table) | none | CC BY 4.0 | B | ❓ | A cross-check for Partifinansiering.no |
| **Kommunal Rapport**: kommunebarometer / ROBEK | Municipal rankings (barometer = proprietary); ROBEK register (official, kmd) | KR site (paywall); ROBEK list on regjeringen.no | — | Proprietary / NLOD | C | ❓ | Use ROBEK (official) and own KOSTRA indicators, not KR's paid barometer |

## 2. Politics, elections, law and government

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Stortinget open data** | Sessions, periods, parties, districts, **emner** (topic tree), committees, representatives (+ photos, biographies), **cases**, **votes**, **per-MP results (2011–12→)**, written and oral questions, interpellations, hearings, meetings, **publications incl. referat (debate transcripts, XML) and innstillinger** · I/N · per event | `https://data.stortinget.no/eksport/<endpoint>?format=json` (see VISION §2.1) | none; **100 calls/min** (429) | NLOD 2.0, credit Stortinget | **A** | ✅ (sesjoner, saker, voteringer, voteringsresultat, partier, fylker, emner, komiteer, representanter, dagensrepresentanter, skriftligesporsmal, sporretimesporsmal, interpellasjoner, horinger, moter, publikasjoner, publikasjon, personbilde) | Real parliamentary behaviour at vote and MP level, plus speech text. Gotchas: .NET dates, integer enums, slow big endpoints (written questions >30 s) |
| **Valgdirektoratet: valgresultat.no API** | Election results for st/sa (2009→ odd years), fy/ko (2011→): votes, %, change, seats, levelling seats, turnout, early votes · N → district → K → **krets** | HAL+JSON `https://valgresultat.no/api/{year}/{type}/{district}/{kommune}/{krets}` | none | NLOD (verify on valg.no) | **A** | ✅ | Geographic politics. Join to KOSTRA/SSB per municipality. Districts = the **old 19 counties** |
| Valgdirektoratet: candidate lists, election statistics | Lists and candidates per election | valg.no downloads (❓); Sikt valglistearkiv (1921→) | none | (verify) | B | ❓ | Who stood, gender/age of lists |
| **Lovdata public API** | *Gjeldende lover*, *gjeldende sentrale forskrifter* (consolidated, daily), **Norsk Lovtidend avd. I 2001→** (incl. skatte-, avgifts- og tollvedtak) | Bulk tarballs `https://api.lovdata.no/v1/publicData/list`, `/v1/publicData/get/<file>` (XML-ish HTML) | none | **NLOD 2.0**, credit Lovdata | **A** | ✅ (list) | Laws and in-force dates for the tracker and events. LAW-tag references for tax parameters. **Don't scrape lovdata.no**; use the API |
| **Party programmes (party websites)** | 2025–2029 national programmes (9 parties; 53–180 PDF pages each) | PDFs on party sites (index: overstortinget.no/partier/programmer) | none | © parties (quote with citation) | **A** | 🌐 | The PROPOSAL layer. Archive the PDF + sha256 + Wayback URL |
| **Sikt Partidokumentarkivet** (PolSys) | Norwegian party documents **1884→**, incl. all programmes | One ZIP (link on polsys.sikt.no: `https://www.nsd.no/data/individ/publikasjoner/Partidokumentarkivet/parti.zip`) | none (verify) | Terms (verify) | **A** | 🌐 (page ✅, zip HEAD timed out) | Historical manifestos 2013/2017/2021 and beyond, for diffing and long-run tracking |
| **Sikt PolSys** | Storting composition since 1814, governments/ministers, party database, valglistearkiv | `https://polsys.sikt.no` (web; downloads) | none | (verify) | B | 🌐 | Historical backbone for parties, governments, MPs |
| **Comparative Manifesto Project (MARPOR)** | Norwegian manifestos coded since 1945 (country 12): category shares, RILE, quasi-sentence annotations for recent elections, the original text corpus | API `https://manifesto-project.wzb.eu/api/v1/` (`list_core_versions` open; `get_core`, `metadata`, `texts_and_annotations` need `api_key`); R `manifestoR` | **free API key** (registration) | Academic/non-commercial, cite (verify) | **A** | 🔑 (list ✅, data → `not_authorized` without key) | External benchmark for our pledge extraction. Long-run party positions |
| **pollofpolls.no** | All published Norwegian polls (national, F, K), averages, seat projections · since ~2000s | HTML tables + RSS (`rss_maling.php`); **no API** | none | **No open licence found**; polls are owned by media/pollsters | B | 🌐 | Valuable, but **don't scrape/republish without written permission**. Link out for now |
| **Partifinansiering.no** | Party accounts (all organisational levels) and campaign contributions · per party/unit · A · 2008→ | Excel downloads ("Alle regnskapstall 2008 … 2025.xlsx", "Valgkampbidrag …") | none | Public register (verify, likely NLOD) | **A** | ✅ (files listed) | Money in politics: state support vs. private donors per party |
| **Wikidata** | Politicians, offices with dates, parties, cabinets, constituencies, IDs to Stortinget/Wikipedia | SPARQL `https://query.wikidata.org/sparql` (set User-Agent) | none | **CC0** | **A** | ✅ (3,600 holders of "member of the Storting") | Glue between datasets. Enrichment only |
| **Wikipedia (no/nn/en)** | Context, timelines, cabinet lists, election pages | MediaWiki API | none | CC BY-SA 4.0 | C | ❓ | Discovery and context text. Never the canonical number |
| **Regjeringsplattformer** (Hurdalsplattformen 2021, later) | Government platforms | regjeringen.no PDF | none | NLOD (verify) | **A** | ❌ (403) | The promises that *can* be enacted. Core for the tracker |
| **Riksrevisjonen** | Audit reports (Dokument 3-series), follow-ups | riksrevisjonen.no (PDF/HTML); also Stortinget saker (Dokument 3:x) | none | NLOD (verify) | B | 🌐 | Independent evaluations of policy implementation, as ESTIMATE/publisher evidence |
| **regjeringen.no høringer** | Consultations + responses | regjeringen.no | none | NLOD (verify) | C | ❌ (403) | Who tried to influence what |
| **Norsk valgundersøkelse** (ISF via Sikt) | Voter surveys 1957→ | Sikt application | registration/application | Restricted (no microdata republication) | C | ❓ | Lab-only aggregates (vote motives, trust) |
| **Norsk medborgerpanel** (Sikt) | Panel survey of attitudes | Sikt application | registration | Restricted | C | ❓ | Lab-only |
| **holderdeord.no / overstortinget.no** | Promise tracking (earlier periods) / programme search + Q&A (2026) | Websites | — | © | C | 🌐 (overstortinget) / ❓ | Prior art: learn from it, don't copy |

## 3. Welfare, health, education, justice

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **NAV statistics** | Unemployment (registered), AAP, uføretrygd, sykepenger, pensions, benefits · N/F/K · M/Q · 2000s→ | nav.no statistics pages (Excel/CSV); ❓ API (`data.nav.no` returned 404) | none | NLOD (verify) | **A** | ❌/❓ | The welfare-state core. Many series are also in SSB |
| **FHI statistikk-API** | Public health statistics (Folkehelsestatistikk, registries aggregates) · N/F/K · A | `https://statistikk-data.fhi.no/api/open/v1/` (sources, tables, dimensions, JSON-stat) | none | NLOD/CC BY (verify) | **A** | ✅ (`Common/source`) | Municipal health profiles. Life expectancy by education/region |
| **Helsedirektoratet** | Waiting times, treatment activity, quality indicators (kvalitetsindikatorer), KPR | `https://api.helsedirektoratet.no` (subscription key for some APIs); Excel downloads | key for API | NLOD (verify) | **A** | 🔑/🌐 | Waiting times are a top political issue |
| **Udir** (Utdanningsdirektoratet) | School results (national tests, exams), pupil survey, school register (NSR) · school/K · A | APIs (elevundersøkelsen, NSR) + Skoleporten downloads | none/varies | NLOD (verify) | **A** | ❌ (`api.udir.no` no response) | School outcomes by municipality and school |
| **DBH (HK-dir)** | Higher education: students, credits, staff, finances, publications · institution · A/semester | `https://dbh.hkdir.no/api/` (JSON query API) | none | NLOD (verify) | B | 🌐 | Higher-ed productivity and funding |
| **Politiet / SSB crime** | Reported crime (SSB), police statistics (STRASAK annual), response times | SSB Statbank; politiet.no PDFs | none | CC BY / NLOD | B | ❓ | Crime trends by district |
| **Kriminalomsorgen** | Prisons, capacity, queue | Annual reports | none | NLOD (verify) | C | ❓ | Justice-sector capacity |
| **Arbeidstilsynet** | Inspections, workplace injuries | Website/open data (❓) | none | NLOD (verify) | C | ❓ | Labour-market regulation |
| **Husbanken** | Bostøtte (housing allowance) statistics | Website (Excel) | none | NLOD (verify) | B | ❓ | Needed for EMTR / benefit modelling |
| **Bufdir** | Child welfare, family statistics | Website | none | NLOD (verify) | C | ❓ | Family policy |

## 4. Energy, environment, geography, transport, primary industries

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **NVE** | Reservoir filling (weekly, by price area, 1995→), hydrology, power plants, licensing | `https://biapi.nve.no/magasinstatistikk/api/...`; HydAPI (key) | none / key (HydAPI) | NLOD | **A** | ✅ (magasin) | Hydro-power reality behind prices |
| **Statnett** | Production/consumption/exchange (live, history) | `https://driftsdata.statnett.no/restapi/...` | none | NLOD (verify) | B | ✅ | Power balance, exports |
| **Elhub** | Metered consumption/production by price area/municipality, hourly | Energy-data API (❓ path) | ❓ | (verify) | B | 🌐 | Consumption by sector/region, a new and granular source |
| **Nord Pool / ENTSO-E** | Day-ahead prices by area | ENTSO-E Transparency API (free token); Nord Pool (licensed) | token | ENTSO-E terms | B | ❓ | Electricity prices, a hot political topic |
| **Sokkeldirektoratet (Sodir, ex-NPD) FactPages** | Fields, production (monthly, 1971→), reserves, licences, wells, investments | `https://factpages.sodir.no` (CSV/XLSX/API downloads) | none | NLOD | **A** | 🌐 | Petroleum economy, from field to fund |
| **Miljødirektoratet** | Emissions by source/municipality (Klimagassutslipp i kommuner), protected areas, environmental data | miljostatus.no / API (❓) | none | NLOD | B | ❓ | Climate policy vs. outcomes at municipal level |
| **Kartverket / Geonorge** | Municipal/county boundaries (by year), addresses, place names, kommuneinfo API | `https://ws.geonorge.no/kommuneinfo/v1/...`; Geonorge downloads (GeoJSON/GML) | none | CC BY 4.0 (verify per dataset) | **A** | ✅ (kommuneinfo) | Maps for every K/F series and election map |
| **MET Norway (Frost)** | Weather/climate observations | `https://frost.met.no` (client ID) | client ID | CC BY 4.0 / NLOD | C | ❓ | Climate context, energy demand |
| **Statens vegvesen** | Vehicle register (kjøretøyopplysninger), traffic counts, road accidents, EV fleet | Autosys API (**key**; `akfell-datautlevering` didn't respond from the box); trafikkdata API (GraphQL, open) | key / none | NLOD (verify) | B | ❌/❓ | EV transition by municipality, traffic |
| **OFV** | New car registrations (monthly) | Website (press releases) | — | © | C | ❓ | EV share (use Vegvesen/SSB where possible) |
| **Avinor** | Passengers per airport, monthly | Website (Excel) | none | (verify) | C | ❓ | Regional mobility, air-travel climate debate |
| **Fiskeridirektoratet** | Catches, quotas, aquaculture, sales by species | Open data portal / downloads (❓) | none | NLOD | B | ❓ | Coastal economy, fish exports, salmon tax (grunnrenteskatt) |
| **Landbruksdirektoratet** | Agricultural subsidies (produksjonstilskudd) by municipality | Website / open data (❓) | none | NLOD | B | ❓ | Agricultural support, a Sp/FrP battleground |
| **Brønnøysundregistrene** | Enhetsregisteret (all entities), roles, accounts (regnskapsregisteret), bankruptcies, corporate-group structure | REST `https://data.brreg.no/enhetsregisteret/api/enheter`, `/roller` | none | NLOD | **A** | ✅ | Firms by municipality/industry; politicians' corporate roles (careful, public role only) |
| **data.norge.no (FDK)** | Catalogue of Norwegian public datasets/APIs | Search API `POST https://search.api.fellesdatakatalog.digdir.no/search`; SPARQL | none | — | **A** | ✅ | Discovery crawler: find APIs we haven't thought of |

## 5. International: harmonised statistics

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **OECD Data Explorer (SDMX)** | Revenue Statistics, **Taxing Wages**, Government at a Glance, SOCX (social spending), PISA, health, productivity, education at a glance · X · A/Q | `https://sdmx.oecd.org/public/rest/data/{agency},{dsd}@{df},{ver}/{key}` | none; **60 data calls/hour**; no VPN | CC BY 4.0 (verify per dataset) | **A** | ✅ (DF_RSOECD: NOR 2024 tax/GDP 40.19) | The best-harmonised comparisons for tax and the welfare state |
| **IMF** | WEO (forecasts), Fiscal Monitor, GFS, IFS, BOP · X · A/Q/M; Article IV reports (PDF) | DataMapper `https://www.imf.org/external/datamapper/api/v1/{indicator}`; SDMX 3.0 `https://api.imf.org/external/sdmx/3.0/` | none | IMF terms (free reuse with attribution, verify) | **A** | ✅ DataMapper (NOR GGXCNL_NGDP 2024 = 12.8% of GDP); 🌐 SDMX | Forecasts (ESTIMATE/publisher). Norway's fiscal surplus vs. peers. **Gotcha:** the DataMapper country path filter is ignored (it returns all 229 countries), so filter client-side |
| **Eurostat** | ESA government finance (`gov_10a_main`, `gov_10a_taxag`, COFOG `gov_10a_exp`), labour, prices, regions (NUTS) · X (EEA incl. NO) · A/Q/M | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}?…` (JSON-stat), SDMX | none | CC BY 4.0 | **A** | ✅ (NO 2025 total expenditure 49.4% of GDP) | Norway vs. Europe on identical ESA definitions |
| **World Bank WDI** | ~16k indicators · X · A · 1960→ | `https://api.worldbank.org/v2/country/{iso3}/indicator/{code}?format=json` | none | CC BY 4.0 | **A** | ✅ | Long-run breadth. Tax indicators are **central government** only |
| **BIS** | Credit, debt service, property prices, policy rates, FX · X · Q/M | SDMX v2 `https://stats.bis.org/api/v2/data/dataflow/BIS/{flow}/1.0/{key}` | none | BIS terms (free, attribution) | B | ✅ (WS_LONG_CPI NO) | Household debt and house prices vs. peers |
| **ILO (ILOSTAT)** | Labour force, unemployment, wages, working hours · X · A | `https://rplumber.ilo.org/data/indicator/?id=…&ref_area=NOR&format=.csv` | none | CC BY 4.0 | B | ✅ | Harmonised labour comparisons |
| **WHO GHO** | Life expectancy, causes of death, health system · X · A | OData `https://ghoapi.azureedge.net/api/{indicator}` | none | CC BY-NC-SA 3.0 IGO (verify) | B | ✅ | Health comparisons (check the NC licence before republishing) |
| **UN / UNdata / UN DESA WPP** | Population prospects, SDG indicators | `https://data.un.org`; SDG API; WPP downloads | none | UN terms (verify) | B | 🌐 | Demographic projections, SDGs |
| **IEA** | Energy balances, prices | Mostly **paid**; some free highlights | paid | Proprietary | C | ❓ | Use OWID/Eurostat energy instead unless licensed |
| **Our World in Data** | Curated global series with metadata · X · A · long history | `https://ourworldindata.org/grapher/{slug}.csv?v=1&csvType=full&useColumnShortNames=true` + `.metadata.json` | none | CC BY 4.0 (OWID work); third-party data keeps original licence | **A** | ✅ | Fast breadth plus long history. Per-series citation |
| **Nordic Statistics (Nordstat)** | Nordic harmonised tables | `https://pxweb.nordicstatistics.org` (PxWeb) | none | (verify) | C | ❓ | Nordic-only comparisons |

## 6. International: political science and governance datasets

| Source | What it covers | Access | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Comparative Manifesto Project (MARPOR)** | See §2: party manifestos coded, 1945→, 50+ countries | API (key), manifestoR | free key | Non-commercial/academic (verify) | **A** | 🔑 | Norway vs. other countries' party positions |
| **ParlGov** | Parties, elections, cabinets for EU/OECD democracies (incl. NO) · party/election/cabinet | CSV `https://www.parlgov.org/data/parlgov-development_csv-utf-8/view_{party,election,cabinet}.csv`, zip, xlsx; Harvard Dataverse (stable versions) | none | CC BY-SA (verify) | B | ✅ (view_election.csv 1.1 MB) | Cabinets and elections in a comparable format |
| **Chapel Hill Expert Survey (CHES)** | Party positions (left-right, EU, GAL-TAN) by experts · party · ~4–5 yearly | `https://www.chesdata.eu` downloads | none | Free with citation (verify) | B | 🌐 | Independent party positioning (a good contrast to manifestos/votes) |
| **CPDS** (Comparative Political Data Set) | Government composition, institutions, socio-economic, OECD countries 1960→ · A | `https://www.cpds-data.org` (xlsx/dta) | none | Free with citation (verify) | B | 🌐 | Political-economy panel (government colour × outcomes) |
| **Quality of Government (QoG)** | 2,000+ governance indicators merged from many sources · X · A | `https://www.gu.se/en/quality-government/qog-data` (csv/dta) | none | Varies by underlying source | B | 🌐 | One-stop governance comparisons |
| **V-Dem** | Democracy indices · X · A · 1789→ | `https://v-dem.net/data/` (csv/R package) | none | CC BY-SA 4.0 (verify) | B | 🌐 | Democracy and institutions benchmarks |
| **European Social Survey (ESS)** | Attitudes, trust, values · individual · biennial 2002→ | `https://ess.sikt.no` (registration for download) | registration | CC BY 4.0 (verify) | B | 🌐 | Trust in parliament/politicians vs. Europe (aggregates) |
| **Eurobarometer** | EU attitudes (NO not regularly included) | GESIS | registration | (verify) | C | ❓ | Limited Norway coverage. Low priority |
| **Comparative Pledges Project** | Pledge-fulfilment data (some countries) | Academic datasets | varies | (verify) | C | ❓ | Methodology template for the tracker |
| **IDEA / IPU Parline** | Turnout, women in parliament | Web/CSV | none | (verify) | C | ❓ | Context for elections and representation |

---

## 7. How to get partiprogrammer (summary; details in VISION §2.3)
1. **Current (2025–2029):** download the PDFs from the nine party websites. Record URL, download date, sha256 and a Wayback snapshot. overstortinget.no lists them all with page counts (Ap 180, FrP 125, H 100, KrF 86, MDG 112, R 106, Sp 140, SV 53, V 68).
2. **Historical (2013/2017/2021 and back to 1945/1884):** **Sikt Partidokumentarkivet**, one ZIP with all party documents 1884→. Party sites' "tidligere programmer" pages and the Wayback Machine fill gaps.
3. **Coded versions:** **MARPOR** API (free key). It has category-coded Norwegian manifestos since 1945 and quasi-sentence annotations for recent elections. Use it for benchmarking and long-run positions, and respect its licence.
4. **Government platforms:** regjeringen.no (blocked from the box, so fetch locally).
5. Store everything in `documents` + `pages`. Never publish full texts we don't have rights to; quote spans with citations.

## 8. Linking reforms and promises to outcomes ("what has worked")
- **Promise fulfilment** = a process chain (manifesto → proposal → vote → law/budget) from Stortinget + Lovdata + DFØ. Measure *whether* a promise was acted on, not whether it worked.
- **Reform timeline** (`events` from Lovtidend in-force dates, budgets, Stortinget decisions), overlaid on outcome series with **descriptive** before/after views and comparator countries.
- **Quasi-experimental (Lab only):** staggered municipal adoption (KOSTRA panels; e.g. eiendomsskatt via SSB 14155) with modern DiD/event-study estimators; synthetic control for national reforms using OECD comparators; placebo tests; a pre-written design note.
- **Prefer curated published evaluations** (SSB Discussion Papers, Frisch Centre, NOU, Riksrevisjonen) as ESTIMATE/publisher evidence over DIY causal claims.
- **Caution:** national reforms coincide with oil-price swings, COVID and energy shocks. Without a credible counterfactual, show associations only and say so on the chart.
