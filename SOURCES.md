# Riksdata — SOURCES: catalogue of data on Norway

> The master list of sources worth integrating, Norwegian and international. It feeds `registry/sources.yaml` (only sources with an adapter go there).
> **v2, 2026-10-03:** merged from the original catalogue plus five parallel source hunts: A (public finance, tax, welfare), B (politics, democracy, media), C (services, energy, geography), D (international, markets, business) and E (niche, surprising). Duplicates were merged and the best verified endpoint kept. All live checks ran from the box on **2026-10-03 (Oslo time)**.
> **Size after dedupe:** **309 catalogue rows** in §1–20 (311 since the two ECHR statistics rows were added to §5 later the same day; §23 has 7 candidates more). That's 289 usable sources/datasets plus 14 explicit "don't use" rows and 6 derived-metric rows. The 15 SSB theme rows in §1b bundle ~150 specific table IDs. Primary check status: ✅ 127 · 🌐 48 · 🔑 9 · ❌ 22 · ❓ 101. (v1 had ~81 rows.)
> **Check** legend: **✅** data endpoint verified (real data returned) · **🌐** site/endpoint reachable, data not parsed or verified · **🔑** reachable but needs a key/registration · **❌** blocked/failed from the box (may work from Egil's Mac, see Appendix A1) · **❓** not checked (desk research / documentation only).
> **Priority:** **A** = core, build early · **B** = valuable, build when its universe is built · **C** = nice-to-have / research / link-out · **—** = don't use.
> **Licence:** stated where confirmed. "(verify)" means believed but not checked on the terms page. Re-check before publishing. ⚠ = a privacy or terms risk (see Appendix A3).
> Granularity shorthand: **N** national · **F** county · **K** municipality · **B** Oslo bydel · **HF** health trust · **G** grid/point/geo · **I** individual unit (person, firm, vehicle, vote, document, award) · **X** cross-country. Frequency: D/W/M/Q/A.

**Contents:** 1 SSB · 2 Public finance, tax, households · 3 Welfare & labour · 4 Politics, elections, law, government activity · 5 Accountability, courts, regulators · 6 Speech, text, media, attention · 7 Opinion & values · 8 Health · 9 Education · 10 Justice · 11 Energy & petroleum · 12 Climate, environment, nature, weather · 13 Transport · 14 Housing, property, geography · 15 Primary industries · 16 Business, innovation, research, markets · 17 Money flows abroad · 18 Society & everyday life · 19 International harmonised statistics · 20 Political science & governance indices · 21 Getting partiprogrammer · 22 Linking reforms and promises to outcomes · 23 Candidates found by the source inventory · **Appendices:** A1 Fetch from Mac or GitHub Actions · A2 Keys and registrations Egil must do himself · A3 Privacy and terms rules

---

## 1. SSB (Statistics Norway): the backbone

### 1a. Core services

| Source | What it covers (granularity · freq · history) | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **SSB Statbank (PxWeb API v2)** | ~3,750 active tables (7,795 incl. discontinued) · N/F/K/B · D–A · some series to 1735 | `https://data.ssb.no/api/pxwebapi/v2` (`/tables?pageSize=10000`, `/tables/{id}/metadata`, `/tables/{id}/data`; json-stat2/csv/**parquet**) | none; 40 calls/60 s; **800k cells/request** | CC BY 4.0 | **A** | ✅ | The backbone. Native Parquet. Gotchas: always pass explicit `valueCodes`; with curl use `-g` or URL-encode the brackets; old `api/v0/dataset` returns **410** |
| SSB **KOSTRA** (in Statbank) | Municipal/county finances and services · K/F/B · A · 2015→ | Same API (e.g. 12367–12369, 13539–13567) | none | CC BY 4.0 | **A** | ✅ | "Din kommune". **12367 has 66.5M cells**, so chunk by year × ~25 municipalities (~1 h backfill) |
| SSB **Klass** (classifications) | Municipality/county codes over time, NACE, COFOG, occupations, crosswalks | `https://data.ssb.no/api/klass/v1` | none | CC BY 4.0 | **A** | ❓ | Time-valid joins across the 2020/2024 reforms |
| SSB **projections** | Population projections to 2100 · K | Statbank | none | CC BY 4.0 | B | ❓ | Ageing and dependency (ESTIMATE/publisher) |
| SSB **Historisk statistikk** | Digitised historical yearbooks (population, prices, wages, elections since 1882, spending 1900→) | `https://www.ssb.no/a/histstat/` (HTML/Excel, NOS PDFs) | none | CC BY 4.0 | B | 🌐 | Back-extends today's Statbank series |
| **microdata.no** (SSB + Sikt) | Register microdata via remote analysis; a public variable catalogue · I · 1967→ | `https://microdata.no/discovery/variables` (catalogue open); analysis via institution login (a UiO PhD qualifies) | Feide/ID-porten | Output control, aggregates only | B (Lab) | 🌐 | Real microsimulation of tax proposals (Lab, aggregates only) |
| **data.norge.no (FDK)** | Catalogue of Norwegian public datasets/APIs (discovery, not data) | Search API `POST https://search.api.fellesdatakatalog.digdir.no/search`; SPARQL | none | — | **A** | ✅ | Discovery crawler. Several track finds (Landbruk, Rovbase, Lånekassen) are listed there |
| SSB **LOTTE-Skatt / KOMMODE** (model docs) | Microsimulation behind the ministry's revenue estimates | ssb.no/forskning (docs; the model isn't public) | — | © SSB | C | ❓ | Methodology reference for ESTIMATE labels |

### 1b. SSB table shortlist (all via `/tables/{id}`, no auth, CC BY 4.0)

| Theme | Tables (IDs) · coverage · history | Pri | Check | Why insightful (example) |
|---|---|---|---|---|
| **Starter set (Phase 1)** | 14710 CPI (2025=100), 13760 LFS monthly, 05803 population 1735→, 14669 COFOG general gov 1995–2025, 07391 tax accounts by type (M), 12439 sickness absence, 09842 GDP per capita | **A** | ✅ | The core of the M1/M2 front page |
| **Wealth concentration** | **10318** net wealth by decile incl. **top 5/1/0.1 %** (2010–2024); 10319 by income decile; **08815** taxable wealth, debt and formuesskatt by component (1999→); 05802/05946/05854/06626/09935/09916/08603/10942 wealth/income/tax by age, wealth interval, decile; 14781 prelim. housing wealth; 05662 wealth by sex (1993→) | **A** | ✅ (10318, 08815) / 🌐 | 2024: top 1 % hold **21.7 %**, top 0.1 % **10.3 %**, and the bottom decile is **−2.7 %**. Who carries the wealth-tax base? |
| **Income distribution** | 07756 Gini/P90-P10/S80-S20 (1986→); **09114 Gini by K and bydel** (2004→); 12558/12563/06946/09903/14484 income by decile/household/age; 10307/12682 percentile cut-offs | **A** | 🌐 | Inequality map. "Where am I in the distribution?" calculator |
| **Debt and housing burden** | 08726/07879/06468/07895/08781 debt-to-income ≥3×/≥5× by decile, household, **K**; 14059–14061 housing costs; 14064 rent burden; 14156 consumer survey 2022 by quartile | **A** | 🌐 | Leverage map. Indirect-tax incidence weights |
| **Low income and benefit groups** | 12599/12598/09008/10459 low income incl. **persistent** (1997→); income accounts and low-income shares for pensioners (13280, 13680–13687), uføre (13076/13077, 13088–13095), AAP (13747–13750, 13755); 09605 60+; **06248** income in G-intervals (1993→); 09855 pensionable income (1967→); 07778; 10496 transfers to immigrant households; 05973 sosialhjelp | **A** | 🌐 | What each benefit group actually lives on. Child poverty over 25 years |
| **Tax and public finance** | **07022 tax intake per municipality, monthly (2008M08→)**; **07107** state revenue items monthly (**1980M01→**); **03730** central-gov accounts quarterly (1985K1→); **14670** local-gov revenue/expenditure (1995→); **12940/08892** AGA base by zone; 08753/11559 gross debt; 10706/10788/11598 financial accounts; 12774/12775 environmental subsidies; 10811/10812 health financing; 13985/13986 state leaders' mobility; **09717** state spending on Svalbard | **A** | ✅ (07022 meta) / 🌐 | 46 years of monthly state revenue. Municipal tax nowcasting. What regionally differentiated AGA costs |
| **KOSTRA detail** | **12367/12368/12369** function × art (K/F/B, 2015→); 13539–13567 key financial figures | **A** | ✅ (meta) | Municipal budget explorer (chunk!) |
| **Labour and wages** | 11418/13311/11658/14756 earnings by occupation/sector; 13861/13862 wage Gini; 03629/07952 labour conflicts (1992→); 12440/12441/12446/12447/12946/14078 sickness absence detail; 11741/11824/11826/11717 disability flows; 07685 labour cost per FTE | **A**/B | 🌐 | Pay by occupation, public vs. private. Strike history |
| **Crime and justice** | **08484** offences by type (1993→), **08485** by police district, **08487** by **municipality**, 08631–08638 victims, 04876/04884 victim survey (1983→); sentencing and prisoner tables | **A** | ✅ (search) | Reported vs. experienced crime |
| **Housing market** | **07221** house price index (Q, 1992→), **06035** price/m² by K, 09895/09897 rents, 06230 rent by tenure | **A** | ✅ (search) | Has the housing ladder been pulled up? |
| **Trade** | **08799** monthly HS8 × country, **08801** annual (1988→), 08803/08804/08806/08809 | **A** | ✅ (meta) | What Norway exports to whom |
| **Business support and R&D** | **12639/12641/12646** business support by type × agency (2002–2025); 07965/07969 R&D financing; 128xx innovation; 09694/09695/09122 bankruptcies (1980→) | **A**/B | ✅ (search) | Total næringsstøtte frame for party proposals |
| **Elections and democracy** | **13151 turnout by election type 1829→**; **11729** party choice by immigrant background; **13710** turnout by country of origin; **05926 + 14662/14663/14679 Sameting roll and turnout** (2005→) | **A**/B | ✅ | 200 years of turnout. The Sami roll **doubled 12,538 → 25,690** (2005–2025) |
| **Society and everyday life** | 10467/10501 first names (1880→); church tables 06929/12025/12026/12444/12273; **grensehandel** 13983/14044/14221–14224; snus/smoking 07692/11427/14447; time use 14320 (1970→); mediation 10937 | B/C | ✅ | Leakage of the excise-tax base to Sweden. Secularisation by municipality |
| **Hunting and wildlife** | 06036 elk shot per county (**1889→**); **03501** wildlife killed outside hunting per K by cause (car/train/predator); 07709 hunters; 03442 foreign hunters | B | ✅ | Roe deer hit by cars: **2,002 (1990/91) → 6,801 (2024/25)** |

---

## 2. Public finance, tax, households (non-SSB)

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **DFØ statsregnskap** | Central-government accounts by kapittel/post/artskonto/agency · M · 2014→ (statsregnskapet.no from 1999); **bevilgningshistorikk** (voted appropriations) | Zip CSV `https://statsregnskapet.dfo.no/nedlasting/statsregnskapet_aar_YYYY.zip`, `_siste_maaned.zip`, `_hittil_i_aar.zip`, full history (50 MB zip / 1.5 GB) | none | NLOD | **A** | ✅ | Actual spending. CSV is `;`, **Windows-1252**, decimal comma, `Periode=YYYYMM` |
| **regjeringen.no budget documents**: Prop. 1 S, Gul bok, **Prop. 1 LS** (tax changes, revenue effects, example calculations), Nasjonalbudsjettet, RNB | Proposed budget per kap/post; tax rule changes · A | regjeringen.no (HTML/PDF/Excel). statsbudsjettet.no now redirects there | none | NLOD (verify) | **A** | ❌ (403) | Baseline for party arithmetic. Golden tests for the tax engine |
| regjeringen.no **Finansdepartementets svar på budsjettspørsmål fra partiene** | Thousands of official costings of party proposals each budget season · 2000s→ | regjeringen.no (statsbudsjettet → "Svar på spørsmål") | none | NLOD (verify) | **A** | ❌ (403) | The cost catalogue behind every alternative budget (ESTIMATE/publisher for F3) |
| regjeringen.no **Grønt hefte + Frie inntekter + terminutbetalinger** | Rammetilskudd components and tax equalisation per municipality · A | regjeringen.no (ODS/xlsx) | none | NLOD (verify) | **A** | ❌ (403) | Who are the net winners of redistribution between municipalities? |
| regjeringen.no **TBU** (kommuneøkonomi; inntektsoppgjørene) | Municipal finance health; wage growth by bargaining area · A | regjeringen.no | none | NLOD (verify) | B | ❌ (403) | Public vs. private wage growth after each settlement |
| regjeringen.no **Statens eierberetning** | ~70 state-owned companies: stake, dividends, return, board, CEO pay · A · 2000s→ | regjeringen.no (xlsx/PDF) | none | NLOD (verify) | **A** | ❌ (403) | State dividend income. CEO pay vs. the state's own guidelines |
| **Skatteetaten trekktabell** (open-source Java) + **all withholding tables (ZIP)** | The official forskuddstrekk algorithm and tables for every monthly wage · A | `github.com/Skatteetaten/trekktabell`; ZIP `https://www.skatteetaten.no/contentassets/62ac7c2863c245398f9caa8b0c6b058a/alletabelleneienfiltilskatteetatenno.zip` | none | Code licence (verify); tables public | **A** | 🌐 | **Golden tests for `riksdata.tax`** |
| Skatteetaten **satser** + skattekalkulator | Current rates and thresholds; calculator (manual use only) | `https://www.skatteetaten.no/satser/` | none | public | B | 🌐 | Parameter cross-check (the LAW source stays Lovtidend) |
| Skatteetaten delings-APIs (skattemelding, inntekt, AGA, MVA) | Person/org lookups | `skatteetaten.github.io/api-dokumentasjon` | agreements | Restricted | **—** | ❓ | **Don't use.** No open statistics API, so use SSB |
| Skatteetaten **skattelister**; **aksjonærregister** person-level | Per-person income/wealth/tax; shareholdings | Login (ID-porten); searches logged | ID-porten | Restricted | **—** | — | ⚠ **Never use** (Appendix A3) |
| **NAV G (grunnbeløp) API** | G, monthly G, average G, adjustment factors, dates · history | `https://g.nav.no/api/v1/grunnbeløp`, `/api/v1/historikk/grunnbeløp?fra=YYYY-MM-DD` | none | NAV open API (verify) | **A** | ✅ (G = **136,549 NOK** from 1 May 2026) | A LAW parameter for every benefit rule (6G ceilings) |
| **Norges Bank SDMX** | Policy rate, FX, government debt, NOWA, Regional Network; **LENDINGSURVEY**, **GOVT_KEYFIGURES**, FINANCIAL_INDICATORS · D–Q | `https://data.norges-bank.no/api/data/{flow}/{key}?format=sdmx-json` | none | NLOD (verify) | **A** | ✅ (IR, EXR) / 🌐 (lending survey) | Monetary policy, NOK, credit standards |
| **Norges Bank Historical Monetary Statistics (HMS)** | House prices for 4 cities **1819–2023**, CPI (to the 1700s), GDP, FX, bond yields, stock prices, money and credit, balance sheets | `https://www.norges-bank.no/globalassets/upload/hms/data/{hmfs-houseprice-indices-norway_1819-2023,cpi,gdp,fx,bond_yields,stockprices,…}.xlsx` | none | (verify, likely NLOD) | **A** | ✅ | 200-year context for housing and rates |
| **NBIM holdings report API** | Every holding (equity, fixed income, real estate, renewables): value, **ownership %, voting %**, country, sector · A + H1 · 1998→ | `https://www.nbim.no/api/investments/v2/report/?assetType=eq\|fi\|re\|ri&date=YYYY-12-31&fileType=csv` (**UTF-16, `;`**) | none | NBIM terms (verify) | **A** | ✅ (2025-12-31 equities, 1.19 MB) | "Your share of the world" |
| **NBIM Voting Records API** | Every vote instruction per company/meeting/proposal · I · 2013→, daily | `https://vd.a.nbim.no/…` | **free key** | NBIM disclaimer (verify) | **A** | 🔑 (`INVALID_API_KEY`) | How the oil fund votes on climate, pay, diversity |
| **Etikkrådet / NBIM exclusions** | Exclusion and observation recommendations, revocations · 2005→ | `https://etikkradet.no/wp-json/wp/v2/posts` (429 posts); nbim.no exclusions table | none | (verify) | B | ✅ (WP JSON) | Fund ethics vs. Storting debates |
| **Finanstilsynet** | Boliglånsundersøkelsen (Excel background data: LTV/DTI, flex quota), Finansielt utsyn chart data, registry API | finanstilsynet.no; registry via data.norge | none | NLOD (verify) | B | ❓ | Mortgage-regulation exceptions, Oslo vs. elsewhere |
| **Gjeldsregisteret nøkkeltall** | Unsecured consumer debt, persons, arrears · M · 2019→ | `https://www.gjeldsregisteret.com/nokkeltall` | none | (verify) | B | 🌐 | Consumer debt after the 2023 rate hikes |
| **Lånekassen** | Students, grants/loans, average debt, repayment, arrears · ~10 yrs | lanekassen.no statistics (JS tables); data.norge "Tildelt stipend og lån" | none | NLOD (verify) | B | 🌐 | Student debt vs. wages |
| **SIFO referansebudsjett** (OsloMet) | Reasonable consumption costs per household type · yearly · 1985→ | Excel/PDF via `nva.sikt.no` (linked from oslomet.no/om/sifo/referansebudsjettet) | none | © OsloMet, cite (verify reuse) | **A** | ❓ | Disposable income minus the SIFO budget = the household margin |
| **Husbanken statistikkbank** | Bostøtte, startlån, tilskudd · K · M/A | `https://statistikk.husbanken.no/` (Qlik, **no API**); history xlsx | none | NLOD (verify) | B | 🌐 | Benefit withdrawal for EMTR. Expect manual exports |
| **SPK / KLP** | Public-sector occupational pensions | Annual reports (PDF) | none | © | C | ❓ | Use KOSTRA balance tables (13541/13558) instead |
| **Frisch Centre / SSB Discussion Papers / NOU evaluations** | Published policy evaluations | frisch.uio.no, ssb.no | none | © authors | C | ❓ | ESTIMATE/publisher evidence on reform events |
| **Kommunal Rapport** (kommunebarometer); **ROBEK** | Municipal rankings (proprietary); ROBEK register (official) | KR (paywall); ROBEK list on regjeringen.no | — | Proprietary / NLOD | C | ❓ | Use ROBEK + our own KOSTRA indicators |

## 3. Welfare and labour

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **NAV statistics files** (replaces the dead `data.nav.no` link) | Hovedtall om arbeidsmarkedet (**helt ledige by fylke/kommune**, seasonally adjusted), helt ledige 1991→, sykepenger by diagnosis/K, uføretrygd, AAP, barnetrygd, kontantstøtte, foreldrepenger, alderspensjon, utbetalte beløp · N/F/K · M/Q | Pages under `https://www.nav.no/no/nav-og-samfunn/statistikk/…` → files `https://www.nav.no/_/attachment/download/<uuid>:<hash>/<file>.csv\|xlsx` (the hash changes monthly, so read the links from the page) | none (our own User-Agent gets the pages and the files; if it is ever refused, use the G API or ask NAV) | **CC BY 4.0** (stated by NAV) | **A** | ✅ (Sept 2026: 59,413 helt ledige, 2.0 %; Oslo 2.7 %) | Unemployment map per month. Sick leave by diagnosis. CSV `;`, Latin-1, decimal comma |
| **NAV pam-stilling-feed** (Arbeidsplassen ads) | Every job ad · D · ~2020→ | `https://pam-stilling-feed.nav.no/api/v1/feed` with Bearer from `https://pam-stilling-feed.nav.no/api/publicToken` | public token | NLOD/terms (verify) | C | ✅ (public token works) | Labour demand by occupation and municipality |
| NAV partner APIs | Person-level benefits | nav.no samarbeidspartner | agreements | Restricted | **—** | ❓ | Not for Riksdata |
| **Arbeidstilsynet open registers** | Approved cleaning firms, staffing agencies, occupational health services, asbestos permits · I (firm) · 2012→ | Docs `https://openapi.arbeidstilsynet.no/`; e.g. `https://data.arbeidstilsynet.no/bemanningsforetaksregisteret2/api` | none | NLOD (verify) | B | 🌐 (docs) / ❌ (data 403) | Staffing-agency growth since the 2019 hiring rules. Inspection outcomes (Tilda) aren't public |
| **Bufdir** | Child welfare and family statistics; grants to youth organisations | bufdir.no | none | NLOD (verify) | C | ❓ | Family policy context |
| **KS** (PAI aggregates, Kommuneøkonomi) | Municipal employees, sick leave, part-time | ks.no (Excel/PDF) | none | © KS (verify reuse) | C | ❓ | Part-time among nurses ("heltidskultur"). Use SSB where possible |
| **Employer and union organisations** (NHO, Virke, Spekter, KS, LO, Unio, YS, Akademikerne) | No open microdata | Brreg (entities); Partifinansiering *Valgkampbidrag* (as donors); SSB strike tables; Fafo organisasjonsgrad | — | — | C | ❓ | Organised interests as donors and hearing participants |

---

## 4. Politics, elections, law, government activity

### 4a. Parliament, elections, parties, law

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Stortinget open data** | Sessions, parties, districts, **emner**, committees, representatives (+ photos, bios), **cases**, **votes**, **per-MP results (2011–12→)**, written/oral questions, interpellations, hearings, meetings, **publications incl. referat (debate XML), innstillinger and Dokument 8 full text** (`publikasjoner?publikasjontype=dok8&sesjonid=…`, then `publikasjon?publikasjonid=dok8-202526-001s`) | `https://data.stortinget.no/eksport/<endpoint>?format=json` (VISION §2.1) | none; **100 calls/min** | NLOD 2.0, credit Stortinget | **A** | ✅ (all main endpoints + dok8 index 2025-26) | Real parliamentary behaviour at vote and MP level, plus speech and proposal text. Gotchas: .NET dates, integer enums, slow big endpoints (written questions 55 s / 6.4 MB) |
| **Stortingets register for verv og økonomiske interesser** | Each MP's/minister's board seats, employers, **shareholdings**, gifts, travel · per person · updated ~fortnightly | PDF `https://www.stortinget.no/globalassets/pdf/verv-og-okonomiske-interesser/arkiv_2025-2026/pr-30-juni-2026.pdf` (71 pp., no API); community parsed archive `github.com/andjar/Stortingets-interesseregister` | none | Public register | B | ✅ (PDF) | Interests vs. committee seats. ⚠ Show only what the register says, with no insinuation (A3) |
| **Valgdirektoratet: valgresultat.no API** | Results st/sa (2009→), fy/ko (2011→): votes, %, seats, levelling seats, turnout · N → district → K → **krets** | HAL+JSON `https://valgresultat.no/api/{year}/{type}/{district}/{kommune}/{krets}` | none | NLOD (verify) | **A** | ✅ | Geographic politics. Districts = the **old 19 counties** |
| **Valgdirektoratet: lists and candidates (XLSX)** | **Every list and candidate** (name, birth year, residence, list position) for kommunestyre/fylkesting/bydel, plus **elected candidates** · 2019/2021/2023/2025 | e.g. `https://www.valg.no/globalassets/dokumenter-2023/om-valg/valgdata/lister-og-kandidater/kommunestyrevalget_2023_lister_og_kandidater_270623.xlsx`; `…/valgte-kandidater/…xlsx` | none | (verify, likely NLOD) | **A** | ✅ (links found) | List demographics. How often personal votes reorder lists. ⚠ Candidates are private persons too: show aggregates, and name only the elected |
| **Sikt Kommunedatabasen API** (newly open) | Thousands of municipal variables: **local election results and kommunestyre composition by party × gender × age** (1968→), finances, population (some 1769→) | `GET https://kommunedatabasen.sikt.no/api/search?q=…` → `/api/variable/{variabelId}/data` | none | (verify on Sikt) | **A** | ✅ | Fills everything before valgresultat.no |
| **Sikt PolSys** | Storting composition since 1814, governments/ministers, party DB, valglistearkiv (1921→) | `https://polsys.sikt.no` | none | (verify) | B | 🌐 | Historical backbone for parties, governments, MPs |
| **Sikt Partidokumentarkivet** | Norwegian party documents **1884→**, incl. all programmes | ZIP `https://www.nsd.no/data/individ/publikasjoner/Partidokumentarkivet/parti.zip` (linked on polsys.sikt.no) | none (verify) | Terms (verify) | **A** | 🌐 (page ✅, ZIP HEAD timed out, so fetch from the Mac) | Historical manifestos for diffing |
| **Sikt Forvaltningsdatabasen** | **Structure of the state**: every ministry/agency with founding, mergers, closures, relocations, staffing · **1947→** | `https://forvaltningsdatabasen.sikt.no` (browse); bulk on request (kontakt@sikt.no) | request | Research terms (verify) | B | ❓ | How many agencies existed under each government |
| **Party programmes (party websites)** | 2025–2029 national programmes (9 parties) | PDFs (index: overstortinget.no/partier/programmer) | none | © parties (quote with citation) | **A** | 🌐 | The PROPOSAL layer. Archive PDF + sha256 + Wayback URL |
| **Regjeringsplattformer** | Government platforms (Hurdal 2021, later) | regjeringen.no PDF | none | NLOD (verify) | **A** | ❌ (403) | The promises that *can* be enacted |
| **Partiregisteret** (Brreg) | All **registered parties** (24 today): orgnr, name, address; registration dates via Enhetsregisteret | CSV `https://data.brreg.no/partiregisteret/api/lastned/csv`; history `https://data.brreg.no/enhetsregisteret/api/enheter?registrertIPartiregisteret=true` | none | NLOD | B | ✅ (24 parties) | New parties per election and their survival. Joins Partifinansiering by orgnr |
| **Partifinansiering.no** | Party accounts at all levels and campaign contributions · 2008→ | Excel downloads ("Alle regnskapstall 2008 … 2025.xlsx", "Valgkampbidrag …") | none | Public register (verify, likely NLOD) | **A** | ✅ (files listed) | Money in politics: state support vs. donors |
| SSB **partifinansiering statistics** | Party income statistics | Statbank (verify table) | none | CC BY 4.0 | C | ❓ | Cross-check for Partifinansiering.no |
| **Lovdata public API** | *Gjeldende lover*, *sentrale forskrifter* (consolidated daily), **Norsk Lovtidend avd. I 2001→** (incl. skatte-/avgiftsvedtak) | `https://api.lovdata.no/v1/publicData/list`, `/v1/publicData/get/<file>` (e.g. `lovtidend-avd1-2001-2025.tar.bz2`, 69 MB) | none | **NLOD 2.0**, credit Lovdata | **A** | ✅ (list; the `get` download hasn't been verified end-to-end) | Laws, in-force dates, LAW tags. Also **law-change velocity** (most-amended laws, election-year bursts). **Don't scrape lovdata.no** |
| **Wikidata** | Politicians, offices with dates, parties, cabinets, IDs | SPARQL `https://query.wikidata.org/sparql` (set a UA) | none | **CC0** | **A** | ✅ (3,600 Storting members) | Glue between datasets |
| **Party Facts** | **ID crosswalk** for parties across ParlGov, CHES, MARPOR, GPS, Wikidata | `https://partyfacts.herokuapp.com/download/` (CSV) | none | ODbL (verify) | B | ❓ | One `party:` entity joined to every international dataset |
| **Wikipedia (no/nn/en)** | Context, timelines, cabinet lists; **opinion-polling pages** (pollster, client, dates, sample, %, 2009→) | MediaWiki API | none | CC BY-SA 4.0 (poll toplines are facts; cite the pollster) | C | ❓ | Discovery text. Fallback poll timeline |
| **pollofpolls.no** | All published polls, averages, seat projections | HTML + RSS; no API | none | **No open licence**; polls owned by media/pollsters | C | 🌐 | ⚠ **Don't scrape or republish without written permission.** Link out |
| **PolitPro API** (licensed alternative to pollofpolls) | Norwegian polls (latest + weekly trend) and historical poll CSVs | `GET https://politpro.eu/api/v1/NO/polls/latest` (Bearer); research CSV at politpro.eu/no/forskningsdata | **token** | Display allowed with attribution + link; no competing poll platform | B | ❓ | Legally displayable poll average vs. results |
| **Holder de ord (HDO) data** + holderdeord.no / overstortinget.no | Pledges 2009–2017 linked to Storting votes (closest prior art to F6); overstortinget programme search | Archived repos `github.com/holderdeord/*` (`all-promises.csv` referenced in hdo-storting-importer) | none | (verify, project licence) | B | ❓ / 🌐 (overstortinget) | **Seed and validation data for the promise tracker** |

### 4b. Government activity and transparency ("what is the state doing")

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **eInnsyn API** (Digdir) | **Every registered document** in public journals of ministries, agencies and many municipalities (journalpost, saksmappe, **møtemappe/møtesak**), bodies; **monthly aggregates incl. access requests** · I (document) · ~2016→ | `GET https://api.einnsyn.no/search?query=…&entity=Journalpost\|Saksmappe\|Moetemappe\|Moetesak`; `GET /enhet`; **`GET /statistics?administrativEnhet=<orgnr>&aggregateFrom=…&aggregateInterval=month`**; spec github.com/felleslosninger/einnsyn-api-spec | none for reading | Public records (verify, likely NLOD) | **A** | ✅ (FIN: **421,420 entries, 23,027 access requests since 2016**) | "Statens postkasse". ⚠ korrespondansepart contains person names, so aggregate to organisations |
| **Støtteregisteret** (Brreg) | Each **state-aid award**: giver, receiver orgnr, **NOK**, instrument, legal basis, purpose, NACE, region, date · I (award) · ~2016→ | **Best endpoint (track B, works):** `POST https://stottetiltak-registerinfo-api.app.brreg.no/api/v1/soek/stoettetildeling?pageSize=1000&page=n` with a JSON **array** body (`[]` = all); `/soek/stoetteordning`; OpenAPI `/v3/api-docs`. **Tracks disagree:** D's guessed `data.brreg.no/stotteregisteret/api/` gave a TLS reset; E's documented `data.brreg.no/rofs/od/rofs/stottetildeling/…` gave 404/timeout (UI `stotte.brreg.no` works). Treat both as dead and re-verify B's endpoint when building the adapter | none (works without a token even though the spec declares bearerAuth) | NLOD (verify) | **A** | ✅ (B: today's awards, e.g. Enova → property firm NOK 52,800) / ❌ (D, E paths) | "Hvem får støtte?" by county, industry, giver. Firms only (⚠ sole proprietors aggregated) |
| **TED API v3** (EU Tenders Electronic Daily) | Norwegian above-threshold procurement notices: buyer, CPV, value, winner, procedure · I (notice/lot) · eForms 2023→, older XML | `POST https://api.ted.europa.eu/v3/notices/search` with `{"query":"buyer-country=NOR","fields":[…]}`; bulk XML packages | none for search | EU reuse (CC BY 4.0, verify) | B | ✅ | Consultancy spend, single-bid rates |
| **Doffin API** (DFØ) | All Norwegian notices incl. below EU threshold · 2017→ (new Doffin 2024) | `https://api.doffin.no/public/v2/search` / APIM `https://dof-notices-prod-api.developer.azure-api.net` (`/public/v1/notices/search`); track A also cites `betaapi.doffin.no/public/v2/notices/search` (unverified) | **free subscription key** (`Ocp-Apim-Subscription-Key`) | NLOD (verify) | B | 🔑 (401 "missing subscription key") | Small municipal purchases too |
| **Anskaffelser.no innkjøpsstatistikk** (DFØ) | Procurement spend by category/agency; municipal supplier statistics · ~2016→ | Power BI / Excel on anskaffelser.no; DFØ data lake `data.dfo.no` (in development) | none | NLOD (verify) | C | ❓ | IT-consultant spend |
| **OpenTender.eu Norway** (DIGIWHIST) | Cleaned tenders with **integrity red flags** · 2006→ | `https://opentender.eu/no/download` (JSON/CSV) | none | CC BY-NC-SA (verify) | C | ❌ (403 Cloudflare) | Single-bid trend. NC licence (A3) |
| **Lobbyregister** | **Doesn't exist.** Voted down June 2025; a study ordered in 2026 (Innst. 135 S (2025–2026)) | Proxies: eInnsyn korrespondansepart (orgs), Stortinget `horinger`, regjeringen høringer | — | — | B (proxy) | ❓ | Who shows up most in hearings and correspondence |
| **regjeringen.no høringer** | Consultations + responses | regjeringen.no | none | NLOD (verify) | C | ❌ (403) | Who tried to influence what |
| **Karantenenemnda** (+ Karanteneutvalget 2005–15) | Every quarantine/recusal decision for departing politicians (who, from which post, to which employer, how long) · **344 decision PDFs** 2015→ | PDFs on regjeringen.no (`/contentassets/e2f33ba7…/YYYY/<name>.pdf`) | none | NLOD (verify) | C | ❌ (403) | Revolving-door chart with Wikidata careers (public role only) |
| **Regjeringens kalender** | Published events of all ministries (2,175 in 2025) + PM weekly programme · ~2010→ | regjeringen.no "Søk i kalenderhendelser" | none | NLOD | B | ❌ (403) | Minister travel per county before elections. Closest lobby proxy |
| **NOU / Meld. St. / Prop. metadata without regjeringen.no** | Stortinget `saker` (every Prop./Meld. St.), NCC (§6, NLOD government docs), NB catalogue (digitised NOUs) | Stortinget API; HF `NbAiLab/NCC`; `api.nb.no/catalog/v1/items` | none | NLOD | **A** (via Stortinget) | ✅ (NB catalogue, Stortinget) | White papers per government per year |
| **Kommunestyre voting** | **No national source.** Some councils publish møtesaker to eInnsyn; vendor portals have no API | eInnsyn `entity=Moetesak` | — | varies | C | ✅ (møtesak) / ❓ (votes) | Realistic scope: political cases per municipality per year |

### 4c. Derived politics metrics (no new source, computed from 4a/4b)

| Metric | Built from | History | Pri | Check | Insight |
|---|---|---|---|---|---|
| **Written-question volume and response times** | Stortinget `skriftligesporsmal` (sent/answered dates, minister, asker party) | 1990s→ (full API 2000s→) | **A** | ✅ (2024–25: **3,234 questions, median 7.1 days; FrP 807, H 721, Sp 472, Ap 8**) | Questions are an opposition tool. Slowest ministers. Pre-election slowdown? |
| **Fate of Dokument 8 proposals** | `saker` (type, proposer party, outcome) + `voteringer` | 2009→ | **A** | ❓ (endpoints ✅) | Pass rate under majority vs. minority governments |
| **Anmodningsvedtak follow-up** | Stortinget vedtak pages + the status table in each ministry's Prop. 1 S | 2016→ | **A** | ❌ (Prop. 1 S on regjeringen) / ❓ | Orders the government ignores |
| **Law-change velocity** | Lovtidend avd. I tarballs | 2001→ | B | ✅ (list) | Most-amended laws, election-year bursts |
| **"Latter i salen" and reprimands** | Referat XML annotations | ~2010→ | C | ❓ | Chamber tone over time |
| **Speech time by CAP topic vs. votes** | ParlaMint 5.0 (§6) + referat + votes + MARPOR | 1998→ | B | ✅ (ParlaMint tarball) | "Ord vs. stemmer" |

---

## 5. Accountability, courts, regulators

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Riksrevisjonen** + **criticism grades** | Dokument 3-series audit reports and follow-ups; each verdict graded ("uakseptabelt", "sterkt kritikkverdig", "kritikkverdig", "ikke tilfredsstillende") per ministry · ~2007/2010→ | riksrevisjonen.no (PDF/HTML); Stortinget `publikasjoner` (Dokument 3:x) | none | NLOD (verify) | **A** | 🌐 | League table of "sterkt kritikkverdig" per ministry and government. ESTIMATE/publisher evidence |
| **Sivilombudet** | Statements with outcome and agency (incl. offentleglova cases); annual case statistics · 1963→ (online ~2000→) | `https://www.sivilombudet.no/uttalelser/` (HTML); årsmelding PDFs | none | NLOD (verify) | B | 🌐 | Which agencies get criticised most |
| **Trygderetten** | Rulings on NAV decisions; annual **omgjøringsprosent** by benefit · 1967→ | `https://www.trygderetten.no` (stats/PDF); rulings on Lovdata (no free API) | none | NLOD (verify) | B | 🌐 | How often NAV is wrong (AAP, uføre), incl. after the 2019 EØS scandal |
| **Diskrimineringsnemnda** | Decisions: ground, sector, outcome · 2018→ | `https://www.diskrimineringsnemnda.no` (SPA; JSON backend, verify) | none | (verify) | C | 🌐 | Which discrimination grounds win |
| **Datatilsynet / Konkurransetilsynet / Finanstilsynet** decisions and fines | Fines, orders, merger interventions, licence revocations per firm · ~2010s→ | datatilsynet.no "Sentrale avgjørelser"; konkurransetilsynet.no vedtak; finanstilsynet.no tilsynsrapporter og vedtak (HTML/PDF) | none | NLOD (verify) | C | 🌐 / ❓ (Finanstilsynet) | Enforcement footprint per year |
| **Regjeringsadvokaten** | Annual report: cases where the state is a party, by ministry, outcome | `https://www.regjeringsadvokaten.no` (PDF/HTML) | none | NLOD (verify) | C | 🌐 | How often the state gets sued and loses |
| ECHR HUDOC | Every ECtHR judgment/decision vs. Norway: article, conclusion, date · 1960s→ | **Not used.** HUDOC has no public data API; `hudoc.echr.coe.int/app/query/results` is its web UI's internal endpoint (Egil, 2026-10-03). Use the two ECHR statistics files below | — | CoE terms (attribution, verify) | **—** | ✅ from the box (356 NOR judgment docs), then dropped | ⚠ No re-identification |
| **ECHR country profile: Norway** | The Court's own profile of Norway (PDF, 228 KB) | `https://www.echr.coe.int/documents/d/echr/CP_Norway_ENG` | none | CoE terms (attribution, verify) | **A** | ✅ from the box. From the Mac our client gets 403, while curl with the same User-Agent gets the PDF | Strasbourg vs. barnevern. ⚠ No re-identification. Compare per capita before ranking |
| **ECHR violations by article and by state** | The Court's yearly statistics table (PDF, 160 KB for 2024) | `https://www.echr.coe.int/documents/d/echr/stats-violation-2024-eng` | none | CoE terms (attribution, verify) | **A** | ✅ from the box. Same 403 as above from the Mac. A wrong address answers 200 with an HTML not-found page, so check the content type | Norway against other states, per article |
| **ESA + EFTA Court** | Infringement cases, reasoned opinions, state-aid decisions; **Internal Market Scoreboard** · 1994→ | `https://www.eftasurv.int`; eftacourt.int (HTML/PDF) | none | (verify) | B | 🌐 | How far behind Norway is on EEA law |
| **EEA-Lex** (EFTA) | Every EU act's EEA incorporation status, JCD date, Art. 103 constitutional requirements · 1994→ | `https://www.efta.int/eea-lex` | none | (verify) | **A** | ❌ (Cloudflare 403) | Share of EU acts that became Norwegian law without a Storting vote |
| **Mattilsynet smilefjes** | **Every food-safety inspection** of restaurants/cafés: orgnr, address, date, grade 0–3 overall and per theme · 2016→ (48,606 inspections) | `https://data.mattilsynet.no/smilefjes-tilsyn.csv` (17 MB, `;`); "Kravpunkter for smilefjestilsyn" | none | NLOD (verify) | **A** | ✅ (52 % no remarks, 13.5 % strekmunn, 1.1 % sur) | Worst kitchens per municipality; chains vs. independents. ⚠ Always show date and re-inspections |

## 6. Speech, text, media, attention

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **ParlaMint-NO 1.2** (Språkbanken) / **ParlaMint 5.0** (CLARIN.SI) | **Every Storting speech** Oct 1998–2022 (~400k speeches, 97.5M words), speaker metadata; 5.0 adds **CAP topic per speech, sentence sentiment**, English MT | `https://www.nb.no/sbfil/parlamint/v1.2_ParlaMint-NO.TEI.tar.gz` (222 MB), `.TEI.ana` (1.8 GB); CLARIN.SI handles 11356/2004–2006; topic/sentiment TSV doi:10.23669/1ZTELP | none | CC BY 4.0 (verify) | **A** | ✅ (HEAD 200) | Rhetoric layer. Extend past 2022 with referat XML |
| **Talk of Norway v1.0.1** (UiO) | ~250k speeches 1998–2016 with rich metadata, lemmas, POS | `https://github.com/ltgoslo/talk-of-norway` | none | (verify, open) | B | ✅ (README) | Validation set for our own speech parsing |
| **Trontaler, CAP-coded** | All 78 Speeches from the Throne 1946–2022, sentence-coded | Supplementary data of "Different governments, similar agendas?" (2023) | none | (verify) | B | ❓ | Does the stated agenda predict bills? |
| NPSC 2.0 | 140 h Storting audio + transcripts 2017–18 | Språkbanken sbr-84 | none | (verify) | C | ❓ | ASR benchmark only |
| **NB DHLAB API** | Word frequencies per year in **Norwegian newspapers and books** (~1800→), concordances, collocations | `https://api.nb.no/dhlab` e.g. `POST /ngram_newspapers {"word":["formuesskatt"],"period":[2000,2020]}`; Python `dhlab` | none | Aggregates OK; texts mostly © | **A** | ✅ (formuesskatt peaks 2009 and 2013) | Political attention history |
| **NB catalogue / IIIF API** | Metadata over all NB holdings incl. digitised reports and NOUs | `GET https://api.nb.no/catalog/v1/items?q=…&filter=mediatype:aviser\|bøker` | none | Metadata open; content often © | B | ✅ | Pre-1998 government reports |
| **Norwegian Colossal Corpus (NCC)** | ~30 GB Norwegian text by `doc_type`: parliament and government reports (NLOD), LovData, books/newspapers (CC0), online news (CC BY-NC) | `https://huggingface.co/datasets/NbAiLab/NCC` | none | Per doc_type | B | ❓ | NOUs and Meld. St. without regjeringen.no |
| **Wikimedia pageviews API** | Daily/monthly views per Wikipedia article · 2015-07→ | `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/no.wikipedia/all-access/user/<Article>/monthly/<from>/<to>` | none (set a UA) | **CC0** | **A** | ✅ (Jan–Sep 2025: Støre 84.6k, Listhaug 73.2k, Solberg 43.5k) | Open attention index. Default over Google Trends |
| Google Trends | Search interest by region · 2004→ | Official Trends API alpha (application-only) | application | Google ToS | C | ❓ | ⚠ No pytrends scraping |
| **GDELT DOC 2.0** | Global news volume/tone by query · rolling ~3 months (GKG longer) | `https://api.gdeltproject.org/api/v2/doc/doc?query=…%20sourcecountry:NO&mode=timelinevol&format=json` | none (1 req/5 s) | Open with citation | C | ✅ (rate-limited, 429) | International attention to Norway |
| **Medietilsynet Mediedatabasen + produksjonstilskudd** | Every news outlet: **ownership**, coverage, **press subsidies** (2025: 163 papers, 440.6 MNOK; Klassekampen 45 MNOK) | Power BI on medietilsynet.no/fakta/mediedatabasen/ (no API); subsidy lists/ownership reports xlsx/PDF | none | NLOD (verify) | B | ✅ (2025 subsidy PDF) / ❓ (DB) | Who owns local news, and how much press support each outlet gets |
| Medietall.no (MBL) | Circulation/readership | Website/PDF | none | © MBL | C | ❓ | Link out |
| PFU-basen | 6,000+ press-ethics cases · 1991→ | `https://pfu.presse.no/pfu-basen` (Algolia, no API) | none | © (verify) | C | ❓ | Ask before any bulk use |
| Retriever / Atekst | 100M+ news articles | Atekst via university library; Mediaresearch API needs permission from each media house | institutional | Proprietary | C (Lab) | ❓ | ⚠ Never republish |
| NTB | News wire | Commercial API | contract | Proprietary | **—** | ❓ | Not usable openly |
| NRK PSAPI | Programme metadata (not news text); RSS headlines | `https://psapi.nrk.no/documentation/` | none/key | NRK terms | C | ❓ | ⚠ No subtitle scraping |

## 7. Opinion, values, expert positions

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Norsk medborgerpanel (NCP)** | ~10k panelists, 3 waves/yr: democracy, trust, climate, migration, policy · 2013→ (32 datasets) | Cross-sections: free order via **Sikt Surveybanken** (download at minforskning.sikt.no); panel/text data via DIGSSCORE (digsscore@uib.no) | Sikt order (Feide) | Research/teaching; no microdata republication; **aggregates with citation OK** | B | ❓ | Wealth-tax support by party voters, 2013→ |
| **Norsk valgundersøkelse (NES)** | Post-election survey: vote choice, motives, issues, trust · 1957→ (2025 not yet released) | Sikt Surveybanken; 2025/2029 run by ISF | Sikt order | As NCP | B | ❓ | Most important issue by party, 1965–2021 |
| **European Social Survey (ESS)** + beta API | Norway in every round: trust in parliament/politicians/parties, immigration, redistribution · 2002→ (R11 2023–24) | `https://ess.sikt.no` (CSV/SPSS/Stata); beta API `https://api.ess.sikt.no/docs` | free ESS login | **CC BY-NC-SA 4.0** (corrected; earlier listed as CC BY) | B | 🌐 | Trust vs. Nordics. ⚠ NC licence: aggregates only, and not on a site with ads (A3) |
| **ISSP** (Role of Government, Social Inequality) | "Are taxes on high incomes too high?", spending preferences · 1985→ (RoG 2026 wave in field) | GESIS (ZA numbers) / Sikt | free registration | Research (verify) | B | ❓ | Feeds the tax pages directly |
| EVS / WVS | Values (NO in EVS 2008/2017, WVS 7) · 1982→ | europeanvaluesstudy.eu / worldvaluessurvey.org | registration | Research | C | ❓ | Long-run values |
| Eurobarometer | Norway **not** in Standard EB | GESIS | — | — | **—** | ❓ | Skip |
| **DFØ Innbyggerundersøkelsen** | Satisfaction with ~20 public services; **trust in public administration** (51 %, −11 pp vs. 2021) · ~2009→ biennial | XLSX tables on dfo.no/undersokelser; microdata via Sikt | none (tables) | NLOD (verify) | B | ❓ | Trust in NAV vs. police vs. municipalities |
| **OECD Trust Survey** | NO 2021/2023: trust in government 48 %, parliament 54 %, parties 36 %, police/courts 77 % | OECD SDMX: `OECD.GOV.GIP,DSD_GOV_INT@DF_GOV_TDG_2025` (trust indicators, Government at a Glance 2025) and `DSD_GOV_TDG_SPS_GPC@DF_GOV_TDG_2023`. Country notes are publications on www.oecd.org, which isn't fetched; microdata on request | none | CC BY 4.0 aggregates (verify) | B | ✅ (dataflow definitions) | Is the trust drop unusual? |
| **Chapel Hill Expert Survey (CHES)** | Expert party positions (left-right, GAL-TAN, EU, salience); **2024 wave incl. Norway** (279 parties, 31 countries) + trend file | `https://www.chesdata.eu` (CSV/DTA) | none | Free with citation | B | 🌐 | Expert positions vs. roll-call similarity |
| Global Party Survey 2019 | Expert ratings incl. populism; 9 Norwegian parties | Harvard Dataverse doi:10.7910/DVN/WMGTNS | none | CC0 / Dataverse (verify) | C | ❓ | Populism score vs. Europe |
| POLIDOC | Manifesto and coalition-agreement archive (23 countries) | polidoc.net | none | Free with citation | C | ❓ | Backup for old manifestos |

---

## 8. Health

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **FHI statistikk-API: 13 registries in one API** | **NPR** (specialist care), **KPR** (municipal care), **LMR** (prescriptions), **MSIS**, **DÅR** (causes of death, 1951→), **MFR** (births, 1967→), **SYSVAK**, **HKR**, **ABR**, drug wholesale and more · N/F/K/HF | `https://statistikk-data.fhi.no/api/open/v1/Common/source` → `/{sourceId}/Table` → `/{sourceId}/Table/{id}/query` (JSON-stat2) | none | NLOD/CC BY (verify per source) | **A** | ✅ | One adapter instead of five. ADHD/antidepressant prescribing vs. NPR contacts |
| **FHI `nokkel`** (Folkehelseprofiler / Kommunehelsa) | 119 tables behind the municipal public-health profiles (skills by parental education, suicide, cancer, CVD…) · K/bydel/F, rolling averages | `…/api/open/v1/nokkel/Table` | none | (verify) | **A** | ✅ | Social health gradients per municipality |
| **Helsedirektoratet HAPI: NKI quality indicators** | ~150–200 indicators: waiting times, **pakkeforløp** compliance, survival, corridor patients, readmissions, GP indicators · N/RHF/HF/**hospital**/K · 2013→ | `https://api.helsedirektoratet.no/innhold/innhold?infoTyper=NKI` (Azure APIM) | **free key** (`Ocp-Apim-Subscription-Key`, utvikler.helsedirektoratet.no) | Helsedir API terms (verify) | **A** | 🔑 (401) | Tests "ventetidsløftet" per hospital |
| **Helsedirektoratet ventetider/pasientrettigheter + SAMDATA** | Waiting times by HF and specialty, deadline breaches, activity and cost per capita · M/A · 2010s→ | helsedirektoratet.no/statistikk (Excel/CSV) | none | NLOD (verify) | **A** | ❓ | Direct test of a government promise |
| **Fastlegestatistikk** (Helsedir/Helfo) | Patients on lists without a GP, list lengths, vacancies · **K** · Q · 2018→ | helsedirektoratet.no "Fastlegestatistikk" (Excel) | none | NLOD (verify) | **A** | ❓ | GP crisis by municipality |
| SKDE **Helseatlas** | Variation in service use between hospital referral areas (standardised) · 2015→ | `https://www.helseatlas.no` (downloads; GitHub `mong/helseatlas`, verify) | none | (verify) | B | ❌ | Unwarranted variation |
| **Kreftregisteret statistikkbank** (now FHI) | Incidence, mortality, survival by site/sex/age/county · 1953→ | `https://sb.kreftregisteret.no/` (Shiny, CSV export); "Cancer in Norway" PDF | none | (verify) | B | ✅ (app loads) | Survival vs. pakkeforløp (2015) |
| Nasjonale medisinske kvalitetsregistre (~50) | Per-hospital results (hip fracture, stroke…) | `https://www.kvalitetsregistre.no/resultater` | none | (verify) | C | ❓ | Local-hospital debates |
| Helsenorge "Velg behandlingssted" | Expected waiting time per treatment and provider (current) | helsenorge.no web app; no public API | — | No open licence | **—** | ❓ | ⚠ Don't scrape. Use NKI |

International health comparisons (WHO GHO, OECD health) are in §19.

## 9. Education

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Udir NSR (Nasjonalt skoleregister)** | All schools (18,358 units incl. closed): owner, public/private, pupils, staff, coordinates | `https://data-nsr.udir.no/v3/enheter` (paged JSON) | none | **NLOD** | **A** | ✅ | School-closure map (centralisation) |
| **Udir NBR (barnehageregister)** | All kindergartens (16,233): owner type, size, coordinates | `https://data-nbr.udir.no/v4/enheter` | none | **NLOD** | B | ✅ | Private vs. municipal kindergartens |
| **Udir Elevundersøkelsen / statistikkbanken API** | Bullying, learning environment, motivation · school/K/F · 2016→ (8 tables) | `https://api.statistikkbanken.udir.no/api/rest/v2/Eksport/{tabell}/filterSpec`, `/filterVerdier`, `/data?filter=…` | none | **NLOD** | **A** | ✅ (table 152) | Bullying since the 2017 kapittel 9A change. (Old `api.udir.no` gave no response, so use these hosts) |
| **Udir Statistikkportalen** (NP, exams, grade points, gjennomføring, **GSI**) | School/K/F results; GSI pupil numbers, teacher density, special ed · GSI 1990s→ | `https://statistikkportalen.udir.no` (UI export; frontend `/api/rapportering/rest/v1/…` undocumented) | none | **NLOD** | **A** | 🌐 | Teacher density vs. outcomes after the 2018 lærernorm |
| Udir nasjonale prøver item-level CSVs | Anonymised item scores per pupil · 2022→ | udir.no/om-udir/data/data-fra-nasjonale-prover/ | none | NLOD | C (Lab) | ❓ | IRT research |
| Udir **Barnehagefakta** API | Staff ratio, pedagogue share, parent survey per kindergarten · 2016→ | Listed on udir.no/om-udir/data (guessed path 404) | none | NLOD | B | 🌐 (404 on guess) | Pedagogue-norm compliance |
| **DBH (HK-dir) query API** | Students, credits, completion, applicants, staff, finances, publications · institution/programme · 1990s→ | `POST https://dbh.hkdir.no/api/Tabeller/hentJSONTabellData` (needs a `filter` block) | none | NLOD (verify) | B | 🌐 (live, validation error) | Completion vs. intake scores |
| Samordna opptak søkertall | Applicants/admitted, points thresholds per programme · 2000s→ | samordnaopptak.no (Excel/PDF); same tables in DBH | none | (verify) | B | ❌ (403) | Nursing/teacher applicant decline. Use DBH |
| NOKUT Studiebarometeret | Student satisfaction per programme · 2013→ | studiebarometeret.no | none | (verify) | C | ❓ | Funding vs. satisfaction |
| utdanning.no API | Occupations, wages, education paths | api.utdanning.no (verify) | none | NLOD (verify) | C | ❓ | Context |

## 10. Justice and police

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **SSB crime tables** | See §1b (08484/08485/08487, victims, victim survey) | SSB API | none | CC BY 4.0 | **A** | ✅ | Reported vs. experienced crime per municipality |
| **Politiloggen API** | Live police incident log (category, district, municipality) · rolling days | `https://api.politiet.no/politiloggen/v1/messages` | none (verify) | (verify, likely NLOD) | B | ❌ (no TCP) | Archive daily via Actions; publish aggregates only |
| **Politiet årsrapport / responstid** | Response times per district/municipality (median, P80), clearance rates · 2015→ | politiet.no (PDF/Excel) | none | NLOD (verify) | B | ❓ | Nærpolitireform vs. rural response times |
| **Domstoladministrasjonen statistikk** | Processing times and case counts per court · 2000s→ | `https://www.domstol.no/om-domstolene/statistikk/` | none | NLOD (verify) | B | 🌐 | Did the 2021 court mergers change processing times? |
| **Kriminalomsorgen** | Capacity, occupancy, **soningskø**, double occupancy · 2010s→ | kriminalomsorgen.no statistics (old URL 404); SSB prisoner tables | none | NLOD (verify) | C | 🌐 (moved) | Sentence queue vs. capacity cuts |
| **DSB BRIS brannstatistikk** | Every fire/rescue call, response time · K · 2016→ | brannstatistikk.no | none | NLOD (verify) | C | ❓ | Response times and municipal mergers |

---

## 11. Energy and petroleum

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **NVE magasinstatistikk** | Reservoir filling, weekly, by price area · 1995→ | `https://biapi.nve.no/magasinstatistikk/api/...` | none | NLOD | **A** | ✅ | The hydro reality behind prices |
| **NVE kraftverk API** | All **1,863** hydropower plants: owner + orgnr, municipality, MW, mean production, zone, licence, year; wind (`WindPowerplant`, verify) | `https://api.nve.no/web/Powerplant/GetHydroPowerPlantsInOperation` | none | NLOD | **A** | ✅ (2 MB JSON) | Who owns the hydropower (state/municipal/private) |
| **NVE nettleietariffer API** | Grid tariffs (energiledd, fastledd, capacity) per grid company, household/cabin/business · 2022-07→ | `https://biapi.nve.no/nettleietariffer/api/NettleiePerOmradePrManedHusholdningFritidEffekttariffer?FraDato=…&Tariffgruppe=Husholdning&Kundegruppe=…` | none | NLOD | **A** | 🌐 (live, 422 without `Kundegruppe`) | The full bill = price + nettleie + taxes |
| NVE **HydAPI / GridTimeSeries (seNorge)** | Discharge/water level per station; 1 km snow/runoff grids · 1957→ | `https://hydapi.nve.no` (key); `https://gts.nve.no/api/GridTimeSeries/…` | key / none | NLOD | C | ❓ | Snow reservoir vs. prices |
| NVE **Varsom APIs** + **regObs** | Avalanche/flood/landslide warnings; **regObs** crowd/pro observations (22,191 in 2025) | `https://api01.nve.no/hydrology/forecast/…`; `POST https://api.regobs.no/v5/Search` (`/Search/Count` ✅) | none | NLOD / CC BY (verify) | C | ❓ (Varsom) / ✅ (regObs) | Where hazards hit, post-Gjerdrum. ⚠ Drop observer names |
| **Statnett driftsdata** | Production/consumption/exchange, live and history | `https://driftsdata.statnett.no/restapi/...` | none | NLOD (verify) | B | ✅ | Power balance, exports |
| **Elhub energy-data API** | Metered consumption **per municipality per hour** by group (private/business/industry); per price area incl. **cabins**; production · ~2021→, ~2-week lag | `https://api.elhub.no/energy-data/v0/municipalities?dataset=CONSUMPTION_PER_GROUP_MUNICIPALITY_HOUR&startDate=…&endDate=…`; `/price-areas?dataset=CONSUMPTION_PER_GROUP_MBA_HOUR` (JSON:API) | none | (verify, believed NLOD) | **A** | ✅ (361 municipalities; NO1 cabins 75 MWh/h) | Behavioural response to the 2022 shock and strømstøtte/Norgespris. Code `0000` = unknown municipality |
| **hvakosterstrommen.no API** | Day-ahead price per hour (15-min from Oct 2025), NO1–NO5, NOK/EUR · 2021-12→ | `https://www.hvakosterstrommen.no/api/v1/prices/YYYY/MM-DD_NO1.json` | none | Free with credit; underlying ENTSO-E/Nord Pool (verify redistribution) | **A** | ✅ (NO4 2026-10-03 ≈ 0.33 NOK/kWh) | Simplest "strømprisen i dag" tile |
| **ENTSO-E Transparency** (canonical) / Nord Pool | Day-ahead prices (A44), load, generation per type, cross-border flows · zone × hour · 2015→ | `https://web-api.tp.entsoe.eu/api?documentType=A44&in_Domain=10YNO-1--------2&…`; Nord Pool is licensed | **free token** | ENTSO-E terms (attribution) | **A** | 🔑 (401) | Canonical price history and cable flows |
| **Enova NOBIL** | Every public EV charging station (location, operator, kW) | `https://nobil.no/api/server/…` | **free key** | CC BY 4.0 (verify) | B | ❓ | Chargers per EV per municipality |
| Energimerkeregisteret (Enova) | Energy labels per building · 2010→ | energimerking.no (verify existence) | ? | (verify) | C | ❓ | Building-stock efficiency |
| **Sodir FactPages CSV export** | Per-field monthly production (1971→) and every FactPages table | `https://factpages.sodir.no/public?/Factpages/external/tableview/field_production_monthly&rs:Command=Render&rc:Toolbar=false&rc:Parameters=f&IpAddress=not_used&CultureCode=en&rs:Format=CSV&Top100=false` (swap the table name) | none | NLOD | **A** | ✅ (2.0 MB CSV) | Which fields pay for the fund |
| **Sodir FactMaps DataService (ArcGIS REST)** | **112 tables/layers**: companies, licences, **licensee/operator history**, rounds, wellbores, fields (EPSG 4230) · 1965→ | `https://factmaps.sodir.no/api/rest/services/DataService/Data/FeatureServer?f=json` → `/{layerId}/query?where=1=1&outFields=*&f=json` | none | NLOD | **A** | ✅ | Who owns the shelf, licensing rounds per government |
| Norsk Petroleum (Energidep. + Sodir) | Curated facts: petroleum revenue, investments, emissions, employment · 1971→ | `https://www.norskpetroleum.no/en/...` | none | NLOD (verify) | C | 🌐 | Narrative cross-check |
| Rystad Energy | Field economics | paid UCube | paid | Proprietary | **—** | ❓ | Don't use |
| **EU ETS Union Registry (EUTL)** | **Free allowances and verified emissions per Norwegian installation** · 2008→ | `https://union-registry-data.ec.europa.eu/report/welcome` (xlsx); EEA ETS viewer | none | EU reuse (verify) | **A** | 🌐 | A hidden subsidy worth NOK billions |
| IEA | Energy balances, prices | mostly paid | paid | Proprietary | C | ❓ | Use OWID/Eurostat instead |

## 12. Climate, environment, nature, weather

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Miljødirektoratet klimagassutslipp i kommuner** | GHG by **municipality** × 10 sectors · 2009→ | `https://www.miljodirektoratet.no/tjenester/klimagassutslipp-kommuner/` (Excel; no API) | none | NLOD | **A** | ❓ | Real cuts or a plant closing? |
| Miljødirektoratet **kartkatalog/ATOM/ArcGIS** | Naturbase (protected areas), contaminated ground, permits… | `https://kartkatalog.miljodirektoratet.no/Dataset/`; `https://nedlasting.miljodirektoratet.no/miljodata/ATOM/…`; `https://kart.miljodirektoratet.no/arcgis/rest/services/` | none | NLOD | B | ❓ | Protected share per municipality vs. wind/cabins |
| **norskeutslipp.no** | Emissions per **industrial facility** (~600) · 1990s→ | norskeutslipp.no (verify API) | none | NLOD | B | ❓ | The top-20 emitters |
| Vannmiljø / Vann-nett | Water quality and ecological status · 1970s→ | `https://vannmiljo.miljodirektoratet.no`; vann-nett.no | none | NLOD | C | ❓ | Oslofjord vs. wastewater spending |
| **Rovbase** (Miljødir) | Dead large carnivores, **compensated livestock losses** per K · 1990s→ | `https://rovbase.no`; data.norge "Rovbase Døde rovdyr og rovviltskade" | none | NLOD (verify) | B | 🌐 | Wolf-zone politics in numbers. ⚠ Coarsen kill locations |
| NILU luftkvalitet API | Hourly NO2/PM per station · 2000s→ | `https://api.nilu.no/aq/utd?…` | **now 401** (key/registration, verify) | NLOD (verify) | B | 🔑 | Effect of diesel bans and tolls |
| **Artsdatabanken Artskart** | Species observations · point | `https://artskart.artsdatabanken.no/publicapi/api/observations/list?taxons=…` | none | CC BY 4.0 (verify) | B | ✅ | Red-listed species per municipality |
| Artsdatabanken Rødlista / Fremmedartslista / NiN | Red list 2021 (2026 expected) | lister.artsdatabanken.no | none | CC BY 4.0 (verify) | C | ❓ | Threats by habitat |
| **GBIF** (Norway node) | 96.7M occurrences with country=NO | `https://api.gbif.org/v1/occurrence/search?country=NO` | none | CC0/CC BY per dataset | C | ✅ | Biodiversity hotspots |
| **MET Frost API** | Station observations, climate normals · 1860s→ some stations | `https://frost.met.no/observations/v0.jsonld` | **free client ID** | **CC BY 3.0 NO** (stated in the API response) | B | 🔑 (401) | Heating-degree days vs. demand |
| seNorge THREDDS | 1 km gridded temperature, precipitation, snow, runoff (NetCDF) · 1957→ | `https://thredds.met.no/thredds/catalog/senorge/catalog.html` | none | CC BY 4.0 (verify) | C | ✅ (catalogue) | Municipal climate stripes |
| Copernicus (CORINE, HRL, Sentinel STAC) | Land cover 100 m (1990→), 10 m layers | `https://stac.dataspace.copernicus.eu/v1` | none / account | Copernicus open | C | ❌ ("Request Rejected") | Nature lost to roads/cabins |
| NIBIO Kilden / AR5 / SR16 | Land resource map, forest, farmland | Geonorge; `https://kilden.nibio.no` WMS | none | CC BY 4.0 (verify) | B | ❓ | Farmland lost per municipality (jordvern) |
| **BarentsWatch fiskehelse API** | Weekly **sea lice per salmon farm**, disease, traffic-light areas · 2012→ | `https://www.barentswatch.no/bwapi/v1/geodata/fishhealth/…` (OAuth client credentials) | **free client** | NLOD | B | ❓ | Lice vs. trafikklys decisions |

## 13. Transport

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **NVDB API Les v4** (Vegvesen) | Every road object: speed limits, tunnels, bridges (+ condition), tolls, accidents, AADT, ferry links | `https://nvdbapiles.atlas.vegvesen.no/vegobjekter/api/v4/vegobjekter/{typeId}?kommune=…` (header `X-Client`) | none | NLOD | **A** | ❌ (no TCP) | Road maintenance backlog vs. county budgets |
| **Trafikkdata API (GraphQL)** | ~10,000 points, hourly volumes by length class, AADT | `POST https://trafikkdata-api.atlas.vegvesen.no/` | none | NLOD | **A** | ❌ (same host) | Toll-ring effects |
| **Vegvesen Autosys kjøretøyopplysninger** | Vehicle register (EV fleet by municipality) | `akfell-datautlevering` API | **key** | NLOD (verify) | B | ❌ (no response) | EV transition per municipality |
| OFV | New car registrations (monthly) | press releases | — | © | C | ❓ | Use Vegvesen/SSB |
| **Entur Journey Planner v3 + national GTFS/NeTEx** | All public transport: stops, routes, timetables, live departures | `https://api.entur.io/journey-planner/v3/graphql` (header `ET-Client-Name`); GTFS `https://storage.googleapis.com/marduk-production/outbound/gtfs/rb_norway-aggregated-gtfs.zip` | none (client name) | NLOD | **A** | ✅ (GTFS updated 2026-10-03 11:47) | Departures per resident within 500 m |
| Entur SIRI-ET history | Actual vs. planned arrivals → punctuality · 2020s→ | Entur public BigQuery (verify) | Google account | NLOD (verify) | B | ❓ | Punctuality after rail tendering |
| **Avinor** flight XML feed + monthly passengers | Live arrivals/departures (archive daily); passengers per airport (Excel) | `https://asrv.avinor.no/XmlFeed/v1.0?airport=OSL&direction=D&TimeFrom=1&TimeTo=2` | none | Avinor terms (verify) | C | ✅ (feed) | Delays at regional airports |
| **Kystdatahuset API** (Kystverket) | 130 endpoints: AIS (open part), **MARU sailed distance by municipality × vessel type × month**, port calls, **cruise arrivals/passengers**, shore power · 2013→ | `https://kystdatahuset.no/ws/api/maru/sailed-distance/county-municipality/2025-01/2025-02` (Swagger `/ws/swagger/v1/swagger.json`) | none (open endpoints) | **NLOD**, credit Kystverket | **A** | ✅ | Cruise traffic per port; shipping emissions per municipality |
| Kystverket raw AIS / BarentsWatch AIS | Live AIS for Norwegian waters | TCP `153.44.253.27:5631`; `https://historic.ais.barentswatch.no/v1/…` (OAuth) | none / free client | NLOD | C | ❓ | Live ship map (archive via Actions) |
| **Bysykkel** (Oslo/Bergen/Trondheim) | Every trip + GBFS · 2019→ | `https://data.urbansharing.com/oslobysykkel.no/trips/v1/YYYY/MM.json` | none | NLOD | C | ✅ | Chartbook fun |
| Bane NOR / Jernbanedirektoratet punctuality | Monthly per line · 2000s→ | banenor.no (Excel, verify) | none | NLOD (verify) | B | ❓ | Punctuality vs. maintenance spend |
| Ferjedatabanken | Ferry traffic per connection | via NVDB (verify) | none | NLOD | C | ❓ | Ferjefri E39 cost vs. traffic |

## 14. Housing, property, geography

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Kartverket kommuneinfo** + boundaries by year | Municipality/county info, boundaries (GeoJSON/GML) | `https://ws.geonorge.no/kommuneinfo/v1/...`; Geonorge downloads | none | CC BY 4.0 (verify per dataset) | **A** | ✅ | Maps for every K/F series |
| **Kartverket/Matrikkelen open products** | **Adresser** (all addresses + coordinates), bygningspunkt, teig; the full Matrikkel API needs an agreement | `https://ws.geonorge.no/adresser/v1/sok?kommunenummer=…` | none / agreement | CC BY 4.0 (verify) | B | ✅ (adresser) | Geocode facilities; catchments |
| **Kartverket stedsnavn API** | Official place names with **language** (Norwegian/Sami/Kven), status, coordinates | `https://ws.geonorge.no/stedsnavn/v1/navn?sok=…` | none | CC BY 4.0 | C | ✅ | Sami/Kven names per municipality (59 places called "Helvete") |
| **SSB befolkning på rutenett (250 m / 1 km)** | Population per grid cell · 2000s→ (verify) | Geonorge "Befolkning på rutenett" (GeoPackage/CSV) | none | CC BY 4.0 | **A** | ❓ | Distance to services for every resident |
| **Geonorge kartkatalog + nedlasting API** | Catalogue and bulk download for ~1,000 datasets (N50, admin units by year, terrain) | `https://kartkatalog.geonorge.no/api/search`; `https://nedlasting.geonorge.no/api/…` | none | per dataset | B | ❓ | Historical municipal boundaries |
| Eiendom Norge / Eiendomsverdi / Finn | Monthly price press releases (free); transactions (paid); listings | press / commercial | — | Proprietary | **—** | ❓ | ⚠ **Don't scrape Finn/Eiendomsverdi.** Use SSB; cite Eiendom Norge headlines |
| **Digitalarkivet** (Arkivverket) | Transcribed censuses 1801–1910, emigrant protocols, church books · historical persons | `https://www.digitalarkivet.no`; data.norge "Folketeljinga 1910" | none | NLOD for transcriptions (verify) | C | 🌐 | Emigration then vs. immigration now |

## 15. Primary industries (fish, farms, salmon)

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Landbruksdirektoratet produksjons- og avløsertilskudd per foretak** | **Every farm business** (36,752 in 2025): orgnr, name, municipality, decares per crop, animals, each scheme, total · 2013→; also **pristilskudd** | `https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/produksjon-og-avlosertilskudd/2025/dataset.csv` (`;`, 11.8 MB); earlier rounds on data.norge | none | NLOD ("åpen lisens", verify) | **A** | ✅ (top 10 % ≈ 35 % of the total; **reconcile with the official total**) | "Gårdsstøtten". ⚠ Sole proprietors are named, so publish distributions and K totals and name only AS/large units |
| **Fiskeridirektoratet Fartøyregisteret extract** | Every vessel + **owner chain** (with %), permits, **quota per vessel × species**, catch vs. quota · daily; history xlsx 2001–2025 | `https://register.fiskeridir.no/fartoyreg/last/frtyweb.tar` (10 MB: `fartoy.csv`, `fartoy_eier.csv`, `juridisk_enhet.csv`, `tillatelser*.csv`, `kvoter.csv`, `fangst.csv`) | none | **NLOD** | **A** | ✅ (top 10 owner groups ≈ 26 % of cod, 30 % of herring quotas, first pass) | "Hvem eier havet?" ⚠ **Person IDs (11 digits): hash or drop at ingest**; persons become "private owners" |
| **Fiskeridirektoratet fangstdata (sluttsedler)** | **Every landing**: date, vessel, gear, species, quantity, value, landing municipality, buyer | `https://register.fiskeridir.no/uttrekk/fangstdata_YYYY.csv.zip` (2024: 50 MB, nightly) | none | NLOD | **A** | ✅ (zip header) | Where fish is landed vs. where owners live |
| **Akvakulturregisteret API** | Every aquaculture site and licence: holder, species, MTB, coordinates, area · 1980s→ | `https://api.fiskeridir.no/pub-aqua/api/v1/sites?range=0-99` (+ licences) | none | NLOD | **A** | ✅ | Salmon-licence concentration since 2017 |
| **Havbruksfondet payouts** | Salmon-licence auction money per coastal municipality/county with calculation basis · 2018→2025 | fiskeridir.no/akvakultur/havbruksfondet ("Beregning utbetaling YYYY … .xlsx") | none | NLOD | **A** | ✅ (2025 xlsx; Frøya ~45.6 MNOK) | Salmon money per resident vs. the local vote |

---

## 16. Business, innovation, research, markets

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Brønnøysund Enhetsregisteret** (+ roller, konkurser, corporate groups) | All entities, roles, bankruptcies | `https://data.brreg.no/enhetsregisteret/api/enheter`, `/roller` | none | NLOD | **A** | ✅ | Firms by municipality/industry; politicians' roles (public role only) |
| **Brreg Regnskapsregisteret API** | Annual accounts per orgnr (income statement, balance, equity, audit) · latest filed year(s) | `https://data.brreg.no/regnskapsregisteret/regnskap/{orgnr}` | none | NLOD | **A** | ✅ (Equinor 2023 equity $48.5 bn) | Join to grants. Per-firm calls only, no bulk |
| **Brreg Frivillighetsregisteret API** | Registered voluntary organisations: category (ICNP), dates, **grasrotandel/momskompensasjon** eligibility · 2008→ | `https://data.brreg.no/frivillighetsregisteret/api/frivillige-organisasjoner` (HAL) | none | NLOD | B | ✅ | Civil-society map. Join Lotteritilsynet momskompensasjon lists (lottstift.no xlsx, 🌐) |
| Brreg beneficial-owner register / aksjonærregister (person level) | Person-level ownership | restricted | — | Restricted | **—** | — | ⚠ **Never use** (A3) |
| **Innovasjon Norge Tildelinger.csv** | **Every grant/loan/guarantee**: firm, **orgnr**, kommune, instrument, amount, date, NACE · 2013 → 24 Sep 2026 (73,891 rows) | `https://indatapublic.blob.core.windows.net/tildelingsrapport/Tildelinger.csv` (`;`, **cp1252**) | none | (verify, likely NLOD) | **A** | ✅ (17.8 MB) | Næringsstøtte per kommune and industry. ⚠ Aggregate sole proprietors |
| **Forskningsrådet open data (GitHub)** `soknader2`, `bevilgningereu` | **All applications since 2004 incl. rejected**: requested vs. awarded, orgnr, kommune, field, instrument, PI gender | `https://raw.githubusercontent.com/Forskningsradet/open-data/main/datasets/soknader2/dataset.csv` (54 MB) | none | (verify) | **A** | ✅ | Success rates by university/region/field |
| **NVA (Nasjonalt vitenarkiv)**, successor to Cristin | All Norwegian research output · Cristin 2011→ | `https://api.nva.unit.no/search/resources?query=…` (old `api.cristin.no` → 403) | none | Metadata open (verify) | B | ✅ | Output per NOK of funding |
| **Patentstyret Open Data API** | Patents, trademarks, designs: applicant, orgnr, status | APIM `https://developer.patentstyret.no/` (e.g. `/register/v1/IprCasesByCompany`) | **free key** | **NLOD 2.0** | B | 🔑 (502 without key) | Patents per firm/kommune |
| EPO OPS | Worldwide patent bibliographic data | `https://ops.epo.org/3.2/rest-services/...` | free OAuth (4 GB/week) | EPO terms (verify) | C | 🔑 (403) | Deep dives only; aggregates via OECD patents |
| **CORDIS** (Horizon funding) | Every H2020/Horizon Europe project with Norwegian participants · 2014→ (FP7 2007→) | `https://cordis.europa.eu/data/cordis-HORIZONprojects-csv.zip` (+ h2020) | none | CC BY 4.0 | B | ✅ (zip) | Does Norway get its EU research money back? |
| **Oslo Børs: Ødegaard OSE asset-pricing data** | Market returns, factors, risk-free rates · 1980–2024 | `https://ba-odegaard.no/financial_data/ose_asset_pricing_data/index.html` | none | Academic, cite (verify) | B | ✅ (page) | Budget-day event studies without Euronext licensing |
| Oslo Børs / Euronext raw prices | Index levels, prices | Euronext (licensed) | — | **Proprietary** | C | ❓ | Don't republish. Use NB HMS stock index (1914→) + Ødegaard |
| Proff.no | Repackaged Brreg | — | — | Proprietary; no scraping | **—** | ❓ | Use Brreg |
| Global Entrepreneurship Monitor | Adult population survey · 1999→ | gemconsortium.org | registration | GEM terms (verify) | C | ❓ | Norway's participation is sporadic |

## 17. Money flows abroad and "hidden budget" items

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **EEA and Norway Grants open data** | Payments to 15 EU countries per programme, **project**, partner + results indicators · 2004→ | `https://data.eeagrants.org/api/overview.json`, `/api/indicators.json` | none | (verify, FMO) | **A** | ✅ (2014–21 ≈ €2.80 bn) | What the "EØS-midler" buy |
| **Norad aid via IATI (d-portal)** | Every aid agreement/activity: partner, country, sector, commitments, disbursements · IATI ~2013→ | `https://d-portal.org/q.json?from=act&reporting_ref=NO-BRC-971277882&limit=…`; Norad `resultater.norad.no/microdata` (SPA, CSV) | none | IATI/Norad open (verify) | **A** | ✅ (d-portal) / 🌐 (Norad) | In-donor refugee costs; who lost after cuts |
| **SIPRI Arms Transfers + Milex** | Norwegian arms exports/imports (TIV), military spending · 1950→ | `https://armstrade.sipri.org` (CSV via form); Milex xlsx | none | SIPRI terms (cite, verify) | C | 🌐 | Who buys Kongsberg missiles |

Other "hidden budget" items are listed elsewhere: EU ETS free allowances (§11), Statens eierberetning (§2), Havbruksfondet (§15), environmental subsidies SSB 12774/12775 (§1b) and AGA by zone SSB 12940 (§1b).

## 18. Society and everyday life

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Vinmonopolet API + salgstall** | Products, stores, stock (API); **annual sales per store** (xlsx) | `https://apis.vinmonopolet.no/products/v0/…`; vinmonopolet.no "salgstall" | **free key** | API terms (verify) | B | 🔑 (401) / 🌐 (site) | Alcohol per adult per municipality; new-store natural experiment |
| **Nobel Prize API + nomination archive** | Laureates; nominations ≥ 50 years old (incl. Norwegian MPs as nominators) · 1901→ | `https://api.nobelprize.org/2.1/laureates`; nobelprize.org/nomination/archive | none | CC0 for API metadata (verify) | C | ✅ (API) / 🌐 (archive) | MPs as Peace Prize nominators by party |
| Kongehuset official programme | Every royal engagement · 2000s→ | kongehuset.no calendar | none | © (facts reusable, verify) | C | ❌ (429 bot check) | Royal visits per county vs. appropriation |

The SSB tables on names, church, grensehandel, snus and time use are in §1b.

---

## 19. International harmonised statistics

### 19a. OECD (one SDMX adapter, many flows)
Base `https://sdmx.oecd.org/public/rest/data/{agency},{dsd}@{df},{ver}/{key}` · no auth · **60 data calls/hour** (cache the dataflow catalogue, 1,547 flows, and each DSD) · CC BY 4.0 (verify per dataset). **Gotcha:** the key needs exactly as many dot positions as the DSD has dimensions, or you get `403 Not enough key values`. `format=csvfilewithlabels` gives readable output.

| Source | What it covers | Flow(s) / example | Pri | Check | Why insightful |
|---|---|---|---|---|---|
| **Revenue Statistics** (comparative) | Tax/GDP by tax type · X · 1965→ | `DSD_REV_COMP_OECD@DF_RSOECD` | **A** | ✅ (NOR 2024 40.19 %) | Tax level vs. OECD |
| **Revenue Statistics, Norway country table** | Every tax code × **government level** in NOK · **1965–2024** | `OECD.CTP.TPS,DSD_REV_OECD@DF_REVNOR,2.0/NOR......` | **A** | ✅ (14,648 rows) | 60 years of tax mix |
| OECD **DF_SSCPTOECD / DF_FSSBOECD** | Social contributions paid by government to itself; benefit financing | `OECD.CTP.TPS` | B | 🌐 (listed) | Denominator honesty for F2 |
| **Taxing Wages** + **TW decomposition** + **PIT/SSC/CIT/dividend rate tables** | Tax wedge by household type, split PIT/SSC/employer; statutory schedules; **combined corporate + dividend rate**; effective corporate rates · 2000→ | `DSD_TAX_WAGES_COMP`, `DSD_TAX_WAGES_DECOMP@DF_TW_DECOMP`, `DF_TW_COU`, `DSD_TAX_PIT@DF_PIT_*`, `DF_SSC_*`, `DF_CIT_DIVD_INCOME`, `DF_ETR_BASELINE`, `DF_WHT` | **A** | ✅ (TW) / 🌐 (others listed) | Golden tests for the engine; the utbytteskatt debate |
| **TaxBEN suite** (`OECD.ELS.JAI`) | **METR** (extra hours), **PTR** incl. childcare, **NRR** by duration, NCC, minimum-income adequacy, **SBE activation strictness** · household type × earnings · 2001–2025 | `DSD_TAXBEN_METR@DF_METR,1.0/NOR..........`, `DF_PTRUB/PTRSA/PTRCCUB/PTRCCSA`, `DF_NRR`, `DF_NCC`, `DF_IA`, `DSD_TAXBEN_SBE@DF_SBE` | **A** | ✅ (METR 2,816 rows; NRR 42,240) | External benchmark for the EMTR flagship |
| OECD TaxBEN web calculator | Household simulation | The calculator's outputs are dataflows: `OECD.ELS.JAI,DSD_TAXBEN_NRR@DF_NRR` (net replacement rates) and the TaxBEN suite above. The calculator page on www.oecd.org isn't fetched | C | ✅ (`DF_NRR` definition) | Manual golden cases |
| **SOCX** incl. detailed flows and **net social spending** | Social spending by function; after tax · 1980→ | `OECD.ELS.SPD,DSD_SOCX_AGG@…` (`DF_PUB_DIS_SIC`, `DF_PUB_FAM`, `DF_PUB_OLD`, `DF_NET_GDP`) | **A** | 🌐 (listed) | Disability spending gross vs. net |
| **LMP** (labour-market programmes) | Spending and participants by programme · 2000–2024 | `OECD.ELS.JAI,DSD_LMP@DF_LMP,1.0` | B | ✅ (2,998 rows) | Active vs. passive vs. Denmark |
| **IDD** (Income Distribution) | Gini, poverty by age, deciles · NOR 1986–2025 | `OECD.WISE.INE,DSD_WISE_IDD@DF_IDD,1.0/NOR.A.INC_DISP_GINI......` (9 dims) | **A** | ✅ (3,028 rows; Gini 65+ 0.225 in 2022) | Comparable inequality |
| **WDD** (Wealth Distribution) | Mean/median net wealth, top shares, assets/debts · NOR 2012/2015/2018/2022 | `OECD.WISE.INE,DSD_WEALTH@DF_WEALTH,1.0/NOR.....` (6 dims) | **A** | ✅ (median NOK 998,500 (2012) → 1,818,065 (2022)) | Formuesskatt context |
| **Economic Outlook 119** + vintages EO 114–118 + long-term scenarios | ~250 macro vars incl. forecasts, output gap, structural balance | `OECD.ECO.MAD,DSD_EO@DF_EO,1.5/NOR.UNR+GGFLMQ+NLGXQ.A`; `DSD_EO_114@DF_EO_114`…; `DSD_EO_LTB@DF_EO_LTB` | **A** | ✅ (NOR unemployment 2024 4.00 %) | Forecast scorecard |
| **Product Market Regulation** | PMR 0–6 + sub-indices (state ownership) · 2018, 2023 | `OECD.ECO.GCRD,DSD_PMR@DF_PMR,1.3/NOR+SWE+DNK..` | **A** | ✅ | Is Norway more state-controlled than Sweden? |
| How's Life / Better Life | ~80 well-being indicators · 2004→ | `OECD.WISE.WDP,DSD_HSL@DF_HSL_CWB,1.1` | B | ❓ | Where Norway doesn't top the OECD |
| **Government at a Glance 2025** | Public finance, COFOG, public employment, procurement, satisfaction/trust · 2007→ | `OECD.GOV.GIP,DSD_GOV@DF_GOV_2025,1.0` (+ `DF_GOV_EMPPS_REP_YU`, `DF_GOV_PPROC_YU`, `DF_GOV_SPS_2025`) | B | 🌐 | Public employment vs. Denmark |
| **Subnational government (SNG-WOFI)** | Municipal revenue, tax, COFOG spending, debt · 2000s→ | `OECD.CFE.RDG,DSD_SNG_WOFI@DF_FINANCE,1.0` / `@DF_COFOG`; `DSD_SNGF_AGG@DF_MUNIFI` | B | 🌐 | How decentralised is Norway? |
| **Employment protection / union density / bargaining coverage** | EPL (1985→), TUD/CBC (1960→) | `OECD.ELS.JAI,DSD_EPL@DF_EPL`; `OECD.ELS.SAE,DSD_TUD_CBC@…` | B | 🌐 | Nordic-model foundations |
| **Pensions at a Glance** | Replacement rates, pension wealth | `OECD.ELS.SPD,DSD_PAG@DF_PRR` (+ `DF_PAG`, `DF_PW`) | B | 🌐 | What folketrygden replaces |
| Environmental Policy Stringency; **net effective carbon rates** | EPS index 1990→; NECR/NEER/CPS 2012→ | `OECD.ECO.MAD,DSD_EPS@DF_EPS,1.0`; `OECD.CTP.TPS,DSD_NECR@…` | B | ❓ / 🌐 | Is Norwegian climate policy stricter? |
| TiVA 2025 | Value-added trade by industry × partner · 1995–2022 | `OECD.STI.PIE,DSD_TIVA_MAINSH@DF_MAINSH,1.1` | B | ❓ | Norwegian VA in exports |
| STRI (incl. intra-EEA) / FDI restrictiveness | Services-trade and FDI barriers | `OECD.TAD.TPD,DSD_STRI_POLICY@…`; `OECD.DAF.INV,DSD_FDIRRI_SCORES@…` | C | ❓ | EEA openness |
| R&D tax incentives, GBARD, MSTI, ANBERD, Patents | Skattefunn generosity, R&D budgets · 1981→ | `OECD.STI.STP,DSD_RDTAX@DF_RDTAX,1.0`; `DSD_MSTI@DF_MSTI,1.3`; `DSD_PATENTS@…` | B | ❓ | R&D vs. Sweden |
| Timely Indicators of Entrepreneurship (Norway) | Firm births/bankruptcies · Q | `OECD.SDD.TPS,DSD_TIE@DF_TIE_NOR,1.1` | C | ❓ | Firm creation after 2022–23 tax changes |
| Productivity DB / STAN; analytical house prices | Productivity by industry; price-to-income/rent | `OECD.SDD.TPS,DSD_PDB@DF_PDB_LV`; `OECD.ECO.MPD,DSD_AN_HOUSE_PRICES@…` | B | ❓ | Overvalued housing? |
| PISA, health, Education at a Glance | Assorted | Health: `OECD.ELS.HD,DSD_SHA@DF_SHA` (expenditure and financing), `DSD_HEALTH_PROC@DF_WAITING` (waiting times). Education: 141 dataflows under `OECD.EDU` (Education at a Glance indicators, TALIS). No dataflow has PISA in its name | B | ✅ (`DF_SHA` definition) | Services comparisons |
| OECD Economic Survey of Norway | Narrative + charts (~2-yearly) | Publication on oecd.org/norway: link out. No data API; its forecasts are in the Economic Outlook dataflow above | B | — (not fetched) | ESTIMATE/publisher layer |

### 19b. IMF (SDMX 3.0 is now the main adapter; DataMapper is a fallback)
Base `https://api.imf.org/external/sdmx/3.0/` · catalogue `/structure/dataflow/*/*/+` (**223 flows incl. dated vintages** such as `WEO_2025_OCT_VINTAGE`, `FM_2025_OCT_VINTAGE`) · data `/data/dataflow/{agency}/{flow}/+/{key}` (positional key) or a filter form with **URL-encoded brackets** (`c%5BCOUNTRY%5D=NOR`, since raw brackets give 400) · no auth · IMF terms (free reuse with attribution, verify). Don't combine `dimensionAtObservation=AllDimensions` with a key. One country × flow ≈ 40 s; page big flows by indicator.

| Source | What it covers | Flow / example | Pri | Check | Why insightful |
|---|---|---|---|---|---|
| **IMF DataMapper** | WEO headline indicators | `https://www.imf.org/external/datamapper/api/v1/{indicator}` (country filter ignored, so filter client-side) | B | ✅ (NOR GGXCNL 2024 = 12.8 %) | Quick fallback |
| **WEO + vintages** | ~45 indicators × 196 countries incl. 5-yr forecasts · 1980→2031 | `/data/dataflow/IMF.RES/WEO/+/NOR.NGDP_RPCH.A`; `WEO_YYYY_MMM_VINTAGE` | **A** | ✅ | Forecast accuracy (vintage vs. outturn) |
| **Fiscal Monitor + vintages** | Balance, primary, debt, **cyclically adjusted** balance | `IMF.FAD/FM` | **A** | ❓ (listed) | Structural surplus vs. oil |
| **Public Sector Balance Sheet (PSBS)** | Assets, liabilities, **net worth** incl. SOEs and resource wealth | `IMF.FAD/PSBS/+/NOR.*.*.*` | **A** | ✅ (slow, 6 MB/30 s) | How rich the state really is |
| **GFS_BS / GFS_SOO / GFS_COFOG / QGFS** | Government finance by subsector · NOR **1972–2025** | `IMF.STA/GFS_BS/%2B/*?c%5BCOUNTRY%5D=NOR&attributes=none` (CSV via `Accept: application/vnd.sdmx.data+csv;version=2.0.0`) | **A** | ✅ (9,008 rows; GG assets 302 % of GDP in 2014) | "Statens balanse" |
| Historical Public Debt (HPD) | Gross debt % GDP · **1800s→** | `IMF.FAD/HPD/+/NOR.*` | B | ❓ | When Norway last had high debt |
| WoRLD (revenue) | Tax by type % GDP · 1980→ | `IMF.FAD/WORLD` | B | ❓ | Non-OECD petro-state peers |
| FSIC / FSIBSIS | Bank soundness, household debt · Q · 2005→ | `IMF.STA/FSIC` | B | ❓ | Banks vs. Sweden |
| PIP / DIP | Portfolio/direct-investment positions by counterpart | `IMF.STA/PIP`, `/DIP` | B | ❓ | Where Norway's money is invested |
| FFS, CRBRATE, ENVTX | Fossil subsidies, carbon prices, environmental taxes · 2015→ | `IMF.STA/FFS` etc. | B | ❓ | Subsidise and tax CO₂ at once? |
| ISORA; FD, SRD, ICSD | Tax-administration survey; decentralisation; reform DB; public capital stock | `ISORA/ISORA_LATEST_DATA_PUB`; `IMF.STA/FD`; `IMF.RES/SRD`; `IMF.FAD/ICSD` | C | ❓ | Skatteetaten efficiency; public under-investment |
| ITG / IMTS / ITS / EQ / ED | Trade by partner, services, export quality/diversification | `IMF.STA/IMTS`, `IMF.RES/ED` | C | ❓ | Diversification vs. petro-states |
| **Article IV, Norway** | Staff report (CR 25/248, Aug 2025), **2026 concluding statement 3 Sep 2026**, Selected Issues | `https://www.imf.org/en/Countries/NOR` (PDF/HTML). A publication: link out, no data API | **A** | — (not fetched) | ESTIMATE/publisher on the fiscal rule |

### 19c. Eurostat, World Bank, BIS, ECB and other statistical agencies

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Eurostat** (core) | ESA government finance (`gov_10a_main`, `gov_10a_taxag`, COFOG `gov_10a_exp`), labour, prices, NUTS regions · X (NO incl.) | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}?…` (JSON-stat) | none | CC BY 4.0 | **A** | ✅ (NO 2025 expenditure 49.4 % of GDP) | Identical ESA definitions |
| Eurostat **COFOG level 2** | e.g. GF1001 sickness & disability, GF0902 secondary education · 1995→ | `gov_10a_exp?geo=NO&cofog99=GF1001` | none | CC BY 4.0 | **A** | ✅ | F1 drill-down with peers |
| Eurostat **EU-SILC** | `ilc_di12` Gini, `ilc_peps01n` AROPE, `ilc_li02`, `ilc_mdsd` deprivation, `ilc_lvho07` housing overburden · 2003→ | same API, `?geo=NO` | none | CC BY 4.0 | **A** | ✅ | Child deprivation vs. Europe |
| Eurostat **ESSPROS** | `spr_exp_func`, `spr_exp_sum`, `spr_pns_ben` · 1990s→ | same API | none | CC BY 4.0 | **A** | ✅ | Cross-check SOCX |
| Eurostat SES / labour cost index | `earn_ses_*`, `lc_lci_*` | same API | none | CC BY 4.0 | B | ❓ | Gender pay gap vs. Europe |
| **Eurostat Comext** | EU-27 trade with **partner = NO** (mirror; Norway isn't a reporter) · 1988→ | `https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?reporter=DE&partner=NO&product=27&flow=1&indicators=VALUE_IN_EUROS&freq=A&time=2024` | none | CC BY 4.0 | B | ✅ (DE imports of NO fuels 2024 = €7.85 bn) | Who depends on Norwegian gas |
| **World Bank WDI** | ~16k indicators · 1960→ | `https://api.worldbank.org/v2/country/{iso3}/indicator/{code}?format=json` | none | CC BY 4.0 | **A** | ✅ | Breadth. Tax indicators are central government only |
| **BIS** (core + specific flows) | `WS_DSR` debt-service ratio, `WS_CREDIT_GAP`, `WS_SPP` property prices, `WS_TC` total credit, `WS_CBPOL`, `WS_LONG_CPI` · Q · 1970s→ | `https://stats.bis.org/api/v2/data/dataflow/BIS/WS_DSR/1.0/Q.NO.H?format=csv` | none | BIS terms (attribution) | **A** | ✅ (household DSR 2026-Q1 **20.9 %**; credit gap −11.7 pp) | Household debt vs. the world |
| **ECB Data Portal** | EUR/NOK reference rate, euro-area comparators · 1999→ | `https://data-api.ecb.europa.eu/service/data/EXR/M.NOK.EUR.SP00.A?format=csvdata` | none | ECB reuse with attribution | B | ✅ (2026-07: 11.08) | Krone vs. euro |
| FRED / ALFRED | Norway series (mostly OECD/IMF mirrors), vintages | `https://api.stlouisfed.org/fred/series/observations?series_id=…&api_key=…` | **free key** | Public domain for Fed series; others keep source licence | C | ❌ (Akamai 403) | Convenience only. Prefer IMF/OECD vintages |
| **ILOSTAT** | Labour force, wages, hours | `https://rplumber.ilo.org/data/indicator/?id=…&ref_area=NOR&format=.csv` | none | CC BY 4.0 | B | ✅ | Harmonised labour |
| **WHO GHO** | Life expectancy, causes of death, health system | `https://ghoapi.azureedge.net/api/{indicator}` | none | CC BY-NC-SA 3.0 IGO (verify) | B | ✅ | ⚠ NC licence (A3) |
| UN / UNdata / WPP / SDG | Population prospects, SDGs | `https://data.un.org`; SDG API | none | UN terms (verify) | B | 🌐 | Projections |
| **UN Comtrade** | Goods trade HS6 × partner, all reporters · 1962→ | Preview (no key, ≤500 rows) `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=579&period=2024&partnerCode=0&flowCode=X&cmdCode=AG2`; full `/data/v1/get/…` | free key (full) | UN Comtrade terms (bulk redistribution limited, verify) | B | ✅ (preview: 97 HS2 rows) | Peer trade. **Norway = 579 here, 578 in ISO numeric** |
| CEPII BACI | Reconciled bilateral HS6 · 1995→ | cepii.fr (zip) | free registration (verify) | Etalab 2.0 (verify) | B | ❓ | Cleaner market shares |
| **Atlas of Economic Complexity** (GraphQL) | ECI, product space, exports · 1995→2023 | `POST https://atlas.hks.harvard.edu/api/graphql` `{ countryYear(countryId: 578, yearMin: 2021, yearMax: 2023) { year eci exportValue gdppc } }` | none | **CC BY-NC-SA 4.0** (verify) | B | ✅ (ECI 0.855 (2021) → 0.733 (2023)) | Is Norway getting less complex? ⚠ NC licence |
| Nordic Statistics (Nordstat) | Nordic tables | `https://pxweb.nordicstatistics.org` | none | (verify) | C | ❓ | Nordic-only comparisons |

### 19d. Long-run history and inequality

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Our World in Data** (generic + slug list) | Curated series with metadata. Norway gems: `gdp-per-capita-maddison-project-database` ✅, `share-of-electricity-production-from-renewable-sources`, `oil-production-by-country`, `co-emissions-per-capita` + `consumption-co2-per-capita`, `share-car-stocks-electric`/`electric-car-sales-share`, `life-expectancy`, `human-development-index`, `government-spending-share-gdp`, `total-tax-revenues-gdp`, `annual-working-hours-per-worker`, `labor-productivity-per-hour-pennworldtable`, `fish-and-seafood-production`, `aquaculture-farmed-fish-production`, `foreign-aid-given-as-a-share-of-national-income`, `military-expenditure-share-gdp` | `https://ourworldindata.org/grapher/{slug}.csv?v=1&csvType=full&useColumnShortNames=true` + `.metadata.json` | none | CC BY 4.0 (OWID work); third-party data keeps its licence | **A** | ✅ (generic + Maddison) / ❓ (other slugs) | Fast breadth plus long history. One adapter + a slug list in the registry |
| **Maddison Project 2023** (via OWID) | GDP per capita · NOR **1820→2022** | slug above (original rug.nl/ggdc) | none | CC BY 4.0 | **A** | ✅ (1820 $1,384 → 2022 $88,366) | Norway overtook its neighbours before oil? |
| **Penn World Table 11.0** | Real GDP (PPP), capital, **TFP**, labour share · 1950→2023 | DataverseNL `doi:10.34894/FABVLR` | none | CC BY 4.0 | **A** | ❌ (Anubis anti-bot; download once from the Mac and vendor it) | Productivity vs. oil rents |
| **Jordà–Schularick–Taylor Macrohistory (R6)** | 18 economies incl. NO: credit, house prices, returns, crises · 1870→2020 | `https://www.macrohistory.net/app/download/9834512469/JSTdatasetR6.xlsx` | none | **CC BY-NC-SA 4.0** (verify) | B | ✅ | Long-run returns on housing vs. equities. ⚠ NC licence |
| **WID.world** | Top income/wealth shares, pre/post-tax, national wealth · NOR top shares ~1875→ | Bulk `https://wid.world/bulk_download/wid_all_data.zip` (882 MB, updated 2026-09-09). Pull only `WID_data_NO.csv` via HTTP range / `remotezip`. The API needs a key | none (bulk) | CC BY 4.0 (verify) | **A** | ✅ | 150 years of the top-1 % share. Note the 2006 dividend-reform income shifting |
| **LIS Cross-National Data Center** | Harmonised household microdata (NO waves 1979→) + free Key Figures workbook | Key figures `https://www.lisdatacenter.org/wp-content/uploads/files/access-key-workbook.xlsx`; microdata via LISSY | free registration (LISSY) | LIS terms (no microdata republication) | B | 🌐 | Harmonised poverty benchmark |
| EUROMOD | EU tax-benefit microsimulation | — | — | — | **—** | ❓ | **Does NOT cover Norway** |

## 20. Political science, governance indices, global rankings

| Source | What it covers | Access | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **Comparative Manifesto Project (MARPOR)** | Norwegian manifestos coded since 1945 (country 12): category shares, RILE, quasi-sentence annotations, text corpus | API `https://manifesto-project.wzb.eu/api/v1/` (`list_core_versions` open; `get_core`, `metadata`, `texts_and_annotations` need `api_key`); R `manifestoR` | **free API key** | Academic/non-commercial, cite (verify) | **A** | 🔑 (list ✅, data `not_authorized`) | Benchmark for our pledge extraction. ⚠ Non-commercial |
| **ParlGov** | Parties, elections, cabinets (EU/OECD) | Harvard Dataverse, **ParlGov 2024 Release**, `doi:10.7910/DVN/2VZ5ZC`: `view_cabinet.tab` (file 10437088), `view_election.tab` (10437092), `view_party.tab` (10437089) at `https://dataverse.harvard.edu/api/access/datafile/<id>`. parlgov.org itself answers 403 to our client | none | **CC0 1.0** (stated on Dataverse) | B | ✅ (dataset and the cabinet file) | Comparable cabinets/elections |
| **CPDS** | Government composition, institutions, OECD 1960→ | `https://www.cpds-data.org` | none | Free with citation (verify) | B | 🌐 | Government colour × outcomes |
| **Quality of Government (QoG)** | 2,000+ governance indicators | `https://www.gu.se/en/quality-government/qog-data` | none | Varies by source | B | 🌐 | One-stop governance |
| **V-Dem** | Democracy indices · 1789→ | `https://v-dem.net/data/` | none | CC BY-SA 4.0 (verify) | B | 🌐 | Democracy benchmarks |
| Comparative Pledges Project | Pledge-fulfilment data | academic | varies | (verify) | C | ❓ | Method template for the tracker |
| IDEA / IPU Parline | Turnout, women in parliament | web/CSV | none | (verify) | C | ❓ | Representation context |
| **UN General Assembly votes** (Voeten et al.) | Every UNGA roll call by country · 1946→ | Harvard Dataverse `doi:10.7910/DVN/LEJUQZ` | none | CC0 (verify) | B | ✅ (metadata) | Norway's foreign-policy fingerprint |
| **World Bank WGI** | 6 governance dimensions: estimate, rank, SE · 1996→2025 | `https://api.worldbank.org/v2/country/NOR/indicator/GOV_WGI_GE.EST?format=json&source=3` (note the `GOV_WGI_` prefix) | none | CC BY 4.0 | **A** | ✅ (GE 2025 = 1.84) | Is effectiveness slipping? |
| **Transparency International CPI** | Score, rank, sources, SE · 2012→ comparable | `https://images.transparencycdn.org/images/CPI2025_Results.xlsx` | none | CC BY 4.0 (data, per HDX); report CC BY-ND | **A** | ✅ (Norway 2025: 81, joint 4th; 85 in 2021) | Why the score fell 4 points |
| **RSF World Press Freedom Index** | Score + 5 sub-indicators · 2002→ (new method 2022→) | `https://rsf.org/sites/default/files/import_classement/{YEAR}.csv` (`;`, decimal comma, odd encoding) | none | Free with credit (verify) | B | ✅ (2026: Norway #1, 92.72) | The economic sub-indicator |
| **UNDP HDI** (+ IHDI, GDI, GII, planetary-adjusted) | Composite indices · 1990→2023 | `https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Composite_indices_complete_time_series.csv` | none | CC BY 3.0 IGO (verify) | B | ✅ (rank 2 in 2023) | The planetary-pressure penalty |
| Freedom House | Political rights/civil liberties · 1973→ | freedomhouse.org "All data" xlsx | none | Free with attribution (verify) | C | ❓ | Benchmark next to V-Dem |
| World Happiness Report | Cantril ladder + factors (country means) · 2005→ | worldhappiness.report data appendix | none | Free with citation (means). Gallup microdata proprietary | B | ❓ | Why Norway fell out of the top 5 |
| Gallup World Poll | Microdata | Gallup Analytics | paid | Proprietary | **—** | ❓ | Don't use |
| Wellcome Global Monitor | Trust in science · 2018, 2020 | Wellcome/Gallup | none | CC BY 4.0 (verify) | C | ❓ | Trust in scientists |
| UBS Global Wealth Report | Wealth per adult · 2000→ | ubs.com PDF/databook | none | © UBS (cite figures) | C | ❓ | Context only |
| World Bank B-READY | Business environment · 2024→ (Norway likely not sampled) | worldbank.org/en/businessready | none | CC BY 4.0 | C | ❓ | Don't use the discontinued Doing Business |

---

## 21. How to get partiprogrammer (summary; details in VISION §2.3)
1. **Current (2025–2029):** download the PDFs from the nine party websites. Record URL, download date, sha256 and a Wayback snapshot. overstortinget.no lists them all with page counts (Ap 180, FrP 125, H 100, KrF 86, MDG 112, R 106, Sp 140, SV 53, V 68).
2. **Historical (2013/2017/2021 and back to 1945/1884):** the **Sikt Partidokumentarkivet** ZIP has all party documents from 1884 (fetch from the Mac; the HEAD timed out from the box). Party sites' "tidligere programmer" pages, the Wayback Machine and POLIDOC fill gaps.
3. **Coded versions:** the **MARPOR** API (free key; A2) has category-coded Norwegian manifestos since 1945. Use it for benchmarking, respecting its licence.
4. **Government platforms:** regjeringen.no, fetched from the Mac (A1).
5. **Opposition proposals as text:** Stortinget `publikasjoner?publikasjontype=dok8` (§4a), for promise → proposal matching.
6. **Seed and validation data:** Holder de ord pledge data 2009–2017 (§4a).
7. Store everything in `documents` + `pages`. Never publish full texts we don't have rights to; quote spans with citations.

## 22. Linking reforms and promises to outcomes ("what has worked")
- **Promise fulfilment** = a process chain (manifesto → Dok 8 / Prop. → vote → law/budget) from Stortinget + Lovdata + DFØ, plus the **anmodningsvedtak** follow-up tables. Measure *whether* a promise was acted on, not whether it worked.
- **Reform timeline** (`events` from Lovtidend in-force dates, budgets, Stortinget decisions), overlaid on outcome series with **descriptive** before/after views and comparator countries.
- **Quasi-experimental (Lab only):** staggered municipal adoption (KOSTRA panels; e.g. eiendomsskatt via SSB 14155) with modern DiD/event-study estimators; synthetic control using OECD comparators; placebo tests; a pre-written design note. microdata.no for register-level work (aggregates only).
- **Prefer curated published evaluations** (SSB Discussion Papers, Frisch Centre, NOU, Riksrevisjonen grades, Trygderetten reversal rates) as ESTIMATE/publisher evidence over DIY causal claims.
- **Caution:** national reforms coincide with oil-price swings, COVID and energy shocks. Without a credible counterfactual, show associations only and say so on the chart.

## 23. Candidates found by the source inventory (2026-10-03)
Seven sources that are not in §1–20. They turned up while testing the catalogue from Egil's Mac (see `docs/v2/source-inventory.md`), mostly through data.norge.no and regjeringen.no's sitemap. Each endpoint below answered on 2026-10-03. Priorities are suggestions. They are not counted in the 309 rows above; fold them into the sections where they belong on the next revision.

| Source | What it covers | Access / base URL | Auth | Licence | Pri | Check | Why insightful |
|---|---|---|---|---|---|---|---|
| **regjeringen.no sitemap** | Every page on regjeringen.no: 80,552 addresses, of which 29,617 documents (2,756 Prop., 5,788 høringer), 383 budget pages and the EØS notes below | `https://www.regjeringen.no/globalassets/sitemap/sitemap.xml` → `sitemap1.xml`, `sitemap2.xml` (15 MB together) | none | NLOD (verify) | **A** | ✅ | The route to regjeringen.no documents that stays inside its robots.txt, which disallows `/api/` and every filtered list (`?documenttype`, `?topic`, `?from` and so on) |
| **EØS-notatbasen** (regjeringen.no) | One note per EU act considered for the EEA Agreement, with Norway's assessment and status: 6,495 gjennomføringsnotat, 3,681 posisjonsnotat, 1,488 forenklet prosedyre, 528 faktanotat, 387 foreløpig posisjonsnotat · 2004→ | Note pages under `https://www.regjeringen.no/no/sub/eos-notatbasen/notatene/<year>/<month>/…`, listed in the sitemap (12,500 pages) | none | NLOD (verify) | B | ✅ (search page) | How much EU law Norway takes in, in which areas and how fast. Pairs with EEA-Lex (§5) |
| **Oslo kommunes statistikkbank** | Oslo statistics by bydel in 14 subject areas (population, income, housing, crime, schools, health, elections and more); for example BEF001, population by bydel, sex and age, 1990–2026 | PxWeb API `https://statistikkbanken.oslo.kommune.no/statbank/api/v1/no/db1` | none | NLOD 2.0 (per data.norge.no) | B | ✅ (folder list and one table's metadata) | Bydel-level series for the capital. The same PxWeb family as SSB |
| **Mattilsynet akvakultur API** | Weekly sea-lice reports per fish farm (2023→), fish-health status per site, cleaner fish, disease cases, operating plans | `https://akvakultur-offentlig-api.fisk.mattilsynet.io/api/lakselus/v2/rapporteringer?aar=…&uke=…` (OpenAPI at `/q/openapi`) | none (a `Client-Id` header naming the client) | NLOD 2.0 (per data.norge.no) | B | ✅ | Sea lice without the BarentsWatch key (§12) |
| **Veterinærinstituttet salmonid mortality API** | Mortality and losses of farmed salmon and rainbow trout by species, period and geography · 2020→, quarterly | `https://apps.vetinst.no/salmonid-mortality-public-api/` | none | NLOD (stated on the page) | C | 🌐 (documentation page; no data call yet) | Fish welfare next to licences and lice |
| **Lotteri- og stiftelsestilsynet open data** | 42 workbooks: momskompensasjon recipients and amounts, grants from Norsk Tipping's surplus, bingo key figures, **party income from bingo** | `https://lottstift.no/nb/om-oss/apne-data/` (xlsx links) | none | NLOD 2.0 (per data.norge.no) | B | ✅ (links) | Money to civil society per organisation. Joins Frivillighetsregisteret (§16) by orgnr |
| **Tolletaten open data** | Customs tariff: tariff structure, current and future duty rates, quotas, free-trade agreements, exchange rates (27 datasets) | CKAN `https://data.toll.no/api/3/action/package_list`; JSON/XML files per dataset | none | CC BY 4.0 (per data.norge.no, verify) | C | ✅ (dataset list) | LAW parameters for import duties, for example on food |

---

## Appendix A1. Fetch from Mac or GitHub Actions (blocked from the box)
These failed from the box on 2026-10-03 (403, Cloudflare/Akamai/Anubis bot checks, no TCP, or timeouts). Registry field: `runner: mac` (or `actions` where a GitHub runner works). **Test each from both places before writing a prompt.** GitHub runners also use datacenter IPs, so Cloudflare-protected sites may block them too, and the Mac is the safe default. Outputs land in the same raw/clean layout and get published to the data release like everything else.

| Host / source | What we need from it | Failure from box | Suggested runner | Notes / fallback |
|---|---|---|---|---|
| **regjeringen.no**: Prop. 1 S, Gul bok, **Prop. 1 LS**, Nasjonalbudsjettet, RNB, Grønt hefte, Frie inntekter, terminutbetalinger, TBU, regjeringsplattformer, høringer, NOU/Meld. St. PDFs, **Karantenenemnda PDFs**, **Statens eierberetning**, **Finansdep. answers to party budget questions**, **government calendar**, **anmodningsvedtak tables (Prop. 1 S)** | Budget baseline, tax golden tests, rammetilskudd, costings, platforms | 403 (bot protection); statsbudsjettet.no redirects here | **Mac** (weekly in budget season, otherwise monthly) | DFØ for actual numbers; Stortinget `saker` + NCC for document metadata/text |
| opentender.eu | Procurement red flags | 403 Cloudflare | Mac | NC licence, so Lab only |
| **EEA-Lex** (efta.int) | EEA incorporation status | 403 Cloudflare | Mac | Respect robots; cache |
| `*.atlas.vegvesen.no` (**NVDB v4, Trafikkdata GraphQL**) | Roads, bridges, tolls, traffic counts | no TCP | Actions or Mac | Set the `X-Client` header |
| Vegvesen Autosys (`akfell-datautlevering`) | Vehicle register | no response | Mac | Key needed too (A2) |
| `api.politiet.no` (Politiloggen) | Police incident log | no TCP | **Actions** (daily archiver) | Rolling feed: archive daily, publish aggregates |
| helseatlas.no | Health-variation atlases | blocked | Mac | GitHub `mong/helseatlas` |
| samordnaopptak.no | Applicant numbers | 403 | Mac | Same tables in DBH |
| Copernicus Data Space STAC | Land cover | "Request Rejected" | Mac / Actions | Low priority |
| FRED / ALFRED | US-hosted mirrors, vintages | 403 Akamai | Mac | Prefer IMF/OECD vintages |
| DataverseNL (**Penn World Table 11**) | TFP, capital stock | Anubis anti-bot | **Manual browser download once**, vendor the file | Record the DOI + sha256 |
| `api.cristin.no` | Research output | 403 | — | Use **NVA** (works) |
| data.arbeidstilsynet.no | Staffing/cleaning registers | 403 (docs reachable) | Mac | — |
| kongehuset.no | Royal programme | 429 Vercel bot check | Mac (polite) | Low priority |
| `api.udir.no` | (old Udir API) | no response | — | Use `data-nsr`, `data-nbr`, `api.statistikkbanken.udir.no` (work) |
| Sikt `parti.zip` (Partidokumentarkivet) | Historical manifestos | HEAD timed out | Mac | One-off download |
| Lovdata `publicData/get` | Lovtidend/laws tarballs | list ✅, the get download was interrupted and not verified | Box (retry) / Actions | 69 MB tarball |
| Brreg Støtteregisteret old paths (`data.brreg.no/stotteregisteret/api/`, `data.brreg.no/rofs/…`) | Aid awards | TLS reset / 404 | — | Use the working `stottetiltak-registerinfo-api.app.brreg.no` endpoint (§4b) |
| **Rolling feeds to archive** (Politiloggen, **Avinor XML**, Kystverket/BarentsWatch **AIS**, Entur live) | Time series that only exist if we keep them | — | **Actions** cron (cheap) | Store compressed daily; publish only aggregates |

## Appendix A2. Free keys and registrations Egil must do himself
All free. Put every key in **GitHub Actions secrets** (and a local `.env` that is git-ignored), never in the repo. The registry field `secret_env:` names the variable. Signup URLs marked "(verify)" are best knowledge, not clicked through.

| # | Source | What the key unlocks | Where to sign up | Header / usage | Needed by |
|---|---|---|---|---|---|
| 1 | **MARPOR** (Manifesto Project) | Coded manifestos, texts, annotations | Create an account at `https://manifesto-project.wzb.eu/signup` (verify), then generate the API key on your profile page | `api_key=` query param → `MANIFESTO_API_KEY` | Promise tracker benchmark (M4) |
| 2 | **Doffin** (DFØ) | Norwegian procurement notices | Azure APIM developer portal `https://dof-notices-prod-api.developer.azure-api.net/` → subscribe to the public product | `Ocp-Apim-Subscription-Key` → `DOFFIN_KEY` | Procurement pages |
| 3 | **NBIM voting records** | Every vote since 2013 | nbim.no → "API access to our voting" (email + accept disclaimer) (verify URL) | key for `vd.a.nbim.no` → `NBIM_VOTING_KEY` | "Oljefondet og deg" |
| 4 | **Helsedirektoratet HAPI** | NKI quality indicators, waiting times | `https://utvikler.helsedirektoratet.no` (self-signup) | `Ocp-Apim-Subscription-Key` → `HELSEDIR_KEY` | "Helsekøen" |
| 5 | **ENTSO-E Transparency** | Prices, load, generation, flows | Register at `https://transparency.entsoe.eu`, then email transparency@entsoe.eu with subject "Restful API access" (verify) | `securityToken=` → `ENTSOE_TOKEN` | Energy universe |
| 6 | **MET Frost** | Weather observations | `https://frost.met.no/auth/requestCredentials.html` | client ID as basic-auth user → `FROST_CLIENT_ID` | Climate/energy context |
| 7 | **BarentsWatch** | Sea lice, fish health, historic AIS | barentswatch.no → Min side → API clients (OAuth client credentials) (verify) | `BW_CLIENT_ID` / `BW_CLIENT_SECRET` | "Kysten i tall" |
| 8 | **NOBIL** (Enova) | EV charging stations | Request a key via `https://info.nobil.no/api` (verify) | `apikey=` → `NOBIL_KEY` | EV pages |
| 9 | **NILU** air quality | Hourly NO2/PM | api.nilu.no (now 401, registration process unclear, verify) | `NILU_KEY` | Air-quality tile |
| 10 | **Vinmonopolet** | Products/stores/stock | Developer portal `https://api.vinmonopolet.no` (verify) | `Ocp-Apim-Subscription-Key` → `VINMONOPOLET_KEY` | Society chartbook |
| 11 | **Patentstyret** | Norwegian IPR register | `https://developer.patentstyret.no/` (self-service) | `Ocp-Apim-Subscription-Key` → `PATENTSTYRET_KEY` | Innovation pages |
| 12 | **EPO OPS** | Worldwide patents (4 GB/week) | `https://developers.epo.org` (register an app, OAuth) | `EPO_KEY` / `EPO_SECRET` | Deep dives only |
| 13 | **FRED** | US-hosted series | `https://fred.stlouisfed.org/docs/api/api_key.html` | `api_key=` → `FRED_KEY` (box blocked, use from the Mac) | Optional |
| 14 | **LIS (LISSY)** | Harmonised microdata (remote) | `https://www.lisdatacenter.org` → data access → LISSY registration (verify) | personal login, not a CI secret | Lab |
| 15 | **ESS / ISSP / Sikt** (NCP, NES) | Survey microdata | ESS: free login at `https://ess.sikt.no` (beta API takes the ESS user id); NCP/NES: order via Sikt Surveybanken, download at `https://minforskning.sikt.no`; NCP panel data via digsscore@uib.no; ISSP via GESIS `https://search.gesis.org` | personal login | Opinion pages (aggregates only) |
| 16 | **PolitPro** | Licensed Norwegian poll series | politpro.eu API registration (verify page) | `Authorization: Bearer` → `POLITPRO_TOKEN` | Poll timeline |
| 17 | **Statens vegvesen Autosys** | Vehicle register (kjøretøyopplysninger) | vegvesen.no → åpne data → API for kjøretøyopplysninger (key application) (verify). NVDB/Trafikkdata need no key, just an `X-Client` header | `SVV_KEY` | EV transition |
| — | *Optional extras* | UN Comtrade full API (comtradeplus.un.org), WID API key, CEPII BACI registration, Google Trends API alpha (application), **microdata.no** (Feide; a UiO PhD qualifies), NVE HydAPI key (`https://hydapi.nve.no`) | | | Lab and depth |
| — | *No key needed, despite appearances* | NAV pam-stilling-feed (NAV publishes a public token at `/api/publicToken`), Støtteregisteret (works without the declared bearer), eInnsyn (key only for publishing), Entur (client-name header only) | | | |

## Appendix A3. Privacy and terms rules (consolidated, binding for adapters and pages)
1. **Aggregate person-level data.** Riksdata publishes statistics about people, not dossiers on people. Where an open register contains private persons:
   - **Farm subsidies (Landbruksdir):** publish distributions, Lorenz curves and municipality totals. Name only AS/SA/large units above a stated threshold. Sole proprietorships stay unnamed.
   - **Fiskeridir `juridisk_enhet.csv` / `fartoy_eier.csv`:** private owners carry 11-digit IDs. **Hash (salted) or drop person IDs at ingest; never persist raw IDs or names**, and show them as "private owners".
   - **eInnsyn korrespondansepart:** aggregate to organisations; drop person names.
   - **Innovasjon Norge / Støtteregisteret recipients that are sole proprietors:** aggregate.
   - **Candidate lists (valg.no):** aggregate demographics; name only elected representatives.
   - Registry flag `pii: none|aggregate|hash_ids`. The storage layer enforces it, and the validator fails a publish if a `pii` column reaches `clean/`.
2. **Never use:** Skatteetaten **skattelister**, the **aksjonærregister at person level**, the Brreg **beneficial-owner register**, NAV partner APIs, Skatteetaten delings-APIs, or anything that requires pretending to be an authorised system.
3. **No scraping where terms forbid it or no permission exists:**
   - **Finn**, Eiendomsverdi, Proff.
   - The **lovdata.no website**: use `api.lovdata.no` only.
   - **pollofpolls.no** without written permission: link out, or use PolitPro/Wikipedia.
   - Helsenorge; NRK subtitles; Google Trends via pytrends.
   - Retriever/Atekst: **never republish**, Lab only.
   - PFU: ask before any bulk use.
4. **Licences with NC/SA/ND terms can't go on a site with ads or any commercial use.**
   - Affected: ESS (**CC BY-NC-SA 4.0**), JST Macrohistory, Atlas of Economic Complexity, OpenTender, WHO GHO (CC BY-NC-SA 3.0 IGO), MARPOR, NCC online-news subset (CC BY-NC), TI CPI report text (ND).
   - Default `publish: false` for these until Egil decides that riksdata.org stays ad-free and non-commercial. Even then, show derived aggregates with attribution and the licence link.
   - ShareAlike sources (ParlGov, V-Dem, Wikipedia) need the same licence on derived *datasets* we redistribute.
5. **Survey and microdata** (NCP, NES, ESS, ISSP, LIS, microdata.no, Udir item-level): publish **aggregates only**, with minimum cell sizes (n ≥ 50 for survey breakdowns; SSB/microdata.no output control applies). Never redistribute microdata files.
6. **Public role only:** MPs, ministers and state secretaries appear in their public roles (votes, questions, registered interests, quarantine decisions, calendars). Show **only what the interests register says, with no insinuation**. No private addresses, family or health.
7. **Courts and complaints:** HUDOC, Sivilombudet, Diskrimineringsnemnda and Trygderetten get aggregate counts by article/outcome/agency. **Never attempt re-identification** (child-welfare applicants are initialled).
8. **Locations and observers:** Rovbase and regObs: drop observer names; coarsen predator kills and dens to municipality. Bysykkel/AIS: aggregate; no individual trip or vessel tracking pages for small/private boats.
9. **Smilefjes and other inspection grades:** always show the inspection date and any re-inspection, and let old results age out of "current" views.
10. **Rolling feeds** (Politiloggen, Avinor, AIS, Entur live): archive raw data privately; publish only aggregates.
11. **Keys and rate limits:** respect robots.txt, documented rate limits (OECD 60/h, Stortinget 100/min, GDELT 1/5 s, SSB 40/60 s) and key terms. Identify with a descriptive User-Agent and contact email, and **never send a browser-like or spoofed User-Agent**: if a host refuses ours, use its official API or bulk route, or ask the publisher. Cache aggressively. Keys live in GitHub secrets only.
12. **Attribution:** every chart carries source + licence; NLOD/CC BY sources are credited as each requires (e.g. "Kilde: Stortinget", "Kystverket").
