# Riksdata — VISION: *Norge som datasett*

> The long-range plan behind `PLAN.md`. PLAN.md covers how we build (Phase 1 details, conventions). This document covers **what we're building over the next ~12 months and why**.
> Written 2026-10-03. Live source checks referenced here were run that day; see `SOURCES.md` for the full catalogue.

---

## 0. The idea in one paragraph
Riksdata becomes a **living, source-linked, versioned quantitative model of Norway**. It joins four worlds that normally never meet: **official statistics** (SSB, Norges Bank, DFØ, NAV, FHI …), **executable rules** (the tax and benefit system as code), **political intent** (party programmes, alternative budgets, government platforms) and **political action** (Stortinget cases, votes and enacted law). One data model, one site. Every number carries its source, unit, vintage and an epistemic tag. Politics is an **overlay** on a coherent model of the country, not the organising principle.

**Design principle:** turn political arguments into inspectable quantities. Not "Party X is high-tax", but *which tax, on which base, raising how much, measured how, compared with whom, and what each party proposes to change, at what estimated cost and according to whom.*

**What makes it distinctive** (the honest moat): plenty of sites do one slice. SSB does statistics. Stortinget.no does votes. pollofpolls.no does polls. overstortinget.no (a new 2026 project) does programme search and Q&A. OWID does global comparisons. Nobody joins them into a single model where a reader can click from *"formuesskatt"* to the current rule, its revenue, its history, the international comparison, each party's proposal, the votes, and what became law.

---

## 1. Product

### 1.1 Information architecture: ten universes
Each universe has a landing page (a mini "state of" dashboard plus a chartbook index), a set of curated series, and links into Explorer.

| # | Universe | Core questions | Backbone sources | First flagship content |
|---|---|---|---|---|
| 1 | **Økonomien** | Growth, productivity, jobs, wages, prices, industry, trade | SSB national accounts, LFS, CPI; Norges Bank; OECD; IMF | "Fastlands-Norge vs. hele Norge": the petroleum split everywhere |
| 2 | **Staten** | What the public sector takes in and spends, and its assets and debt | SSB 14669 (COFOG), DFØ statsregnskap, Prop. 1 S, NBIM, Eurostat `gov_10a_main` | **Hvor går 1000 kroner?** |
| 3 | **Skatt** | Tax architecture, burden, distribution, history, calculators | OECD Revenue Stats and Taxing Wages, SSB tax tables, Lovdata skattevedtak, Prop. 1 LS | **Hva betyr "skattetrykk"?** + tax calculator |
| 4 | **Velferd** | Pensions, NAV benefits, sick leave, disability, family benefits | NAV statistics, SSB 12439 etc., OECD SOCX | Disability and sick-leave trends vs. the Nordics |
| 5 | **Befolkningen** | Demography, migration, fertility, ageing, geography | SSB 05803, 07459, immigration tables, OWID | Dependency ratio 1950–2060 (SSB projections) |
| 6 | **Offentlige tjenester** | Health, schools, police, transport, municipalities | KOSTRA (SSB), Helsedirektoratet waiting times, Udir, DBH, Politiet, Vegvesen | "Din kommune": KOSTRA profile vs. comparable municipalities |
| 7 | **Energi, klima og natur** | Power, hydro, petroleum, emissions, land use | NVE, Statnett, Elhub, Sodir factpages, Miljødirektoratet, SSB emissions | Reservoirs + prices + exports, one view |
| 8 | **Partiene** | What each party proposes, costs, changes over time | Programmes (party sites, Sikt archive, MARPOR), alternative budgets (Innst. 2 S), Partifinansiering, polls | **Party fiscal arithmetic** |
| 9 | **Stortinget** | Representatives, cases, votes, questions, committees | data.stortinget.no, Wikidata | **Party voting similarity** + MP pages |
| 10 | **Norge vs. verden** | Disciplined international comparison | OECD, Eurostat, IMF, World Bank, OWID, ILO, WHO, V-Dem, QoG | "Where Norway is most unusual" (z-scores vs. OECD) |

A cross-cutting **Tracker** (manifesto → vote → law) and **Tidslinje** (governments, reforms, budgets, elections) sit on top.

### 1.2 Front page: "Norge 2026", the State-of-Norway terminal
- **Layout:** 8–10 blocks (Folk · Økonomi · Staten · Husholdninger · Velferd · Tjenester · Næringsliv · Energi · Miljø · Politikk). Each block has 3–5 tiles: the latest value, change vs. last year, a 20-year sparkline, and the publication date.
- **Every tile** shows the source and tag on hover, and opens the series page in Explorer.
- **"Siste nytt fra datakildene"** strip: the most recently updated series ("SSB published KPI for September today"). It comes free from `source_updated` in the lake and gives people a reason to come back.
- **Politikk block:** current government and support basis, seat distribution (Stortinget), poll average (only if licensing allows, see SOURCES), and the next budget/election date.
- **Design:** dense, typographic, Bloomberg-meets-Scandinavian (carry over v1's flat style and party colours). It must be fast: static JSON only, under 300 KB on first load.
- **MVP:** 24 tiles from SSB + Norges Bank + OWID, built from `registry/frontpage.yaml`.

### 1.3 Explorer (the workhorse)
Search (`catalog.json`, Norwegian and English synonyms: "sykefravær" → sickness absence), then a **series page** with:
- line/bar/table/map views (maps for county/municipality series via Kartverket polygons)
- compare entities (Nordics, OECD, chosen municipalities)
- **transform toggles** that are always explicit about the denominator: level · per capita · % of GDP · % of *mainland* GDP · real (CPI-deflated) · index (base year chosen) · YoY
- government-period background band (from v1) and **reform/event markers**
- a metadata panel (source, table ID, licence, unit, frequency, vintage, methodology link, "last checked"), CSV/Parquet download, and a permalink with state in the URL
- "Related": same concept from other sources (e.g. WB vs. OECD tax/GDP), with an explanation of the difference.

### 1.4 Chartbook
Curated long-read pages in MDX: prose plus `<Chart>` specs that point at series IDs. No hand-made images. Planned books:
1. **Norge i 30 grafer**: the yearly flagship, refreshed automatically.
2. **Skatt i Norge**: a tour of the tax system.
3. **Statens penger**: revenue, spending, the fiscal rule, the fund.
4. **Velferdsstaten i tall.**
5. **Norge vs. Norden.**
6. **Stortinget 2025–2029**: a live parliamentary yearbook.
7. **Budsjett 2027**: the government proposal, the alternative budgets and the final agreement, published during budget season.

### 1.5 Flagship pages (the six that define Riksdata)

#### F1. **Hvor går 1000 kroner?** (Staten)
- **Question:** of every 1,000 kroner the public sector spends, where does it go, and how has that changed since 1995?
- **Data and sources:**
  - SSB **14669** *General government expenditure by sector, type and function (COFOG)* 1995–2025 (✅ found via v2 search) for the **general government** lens (state + municipalities, consolidated).
  - **DFØ statsregnskap** CSVs (✅ `https://statsregnskapet.dfo.no/nedlasting/statsregnskapet_aar_YYYY.zip`, monthly `…_siste_maaned.zip`, years 2014→). Columns: `År; Periode; Programområde; Programkategori; Fagdepartement; Kapittel; Post; Kontoklasse; Artskonto; Virksomhet; Beløp`. This is the **central government accounts** lens at chapter/post level.
  - DFØ **bevilgningshistorikk** (full appropriation history CSV) for voted budget vs. actual.
  - **Prop. 1 S / Gul bok** tables (regjeringen.no) for the *proposed* budget. regjeringen.no returned **403** from the box, so expect bot protection and fetch from Egil's Mac or use the statsbudsjettet.no downloads.
  - SSB population for per-capita figures, and SSB CPI for real terms.
- **Model:** shares = expenditure_function / total × 1000, per year. Two lenses that must never be mixed: (a) general government COFOG (includes municipalities; consolidates transfers between government levels), and (b) the state budget (includes transfers to municipalities and to the oil fund, so exclude *lending and financial transactions*, and report the transfer from SPU separately). Real-terms and per-capita toggles.
- **Visual:** a zoomable icicle/treemap: 1000 kr → 10 COFOG functions → sub-functions (COFOG level 2) → (state lens) programområde → kapittel → post. A time slider (1995–2025) and a "small multiples" view of each function's share over time. The mirror page **"Hvor kommer pengene fra?"** is a Sankey from tax types (SSB 07391, OECD Revenue Stats) and petroleum cash flow into the budget.
- **MVP:** COFOG level 1 for 2025, treemap plus a 1995–2025 share chart, per-capita and real toggles. About 1 weekend after the Phase 2 site exists.

#### F2. **Hva betyr "skattetrykk"?** (Skatt)
- **Question:** is Norway high-tax? The answer depends on the denominator and coverage, so show all of them.
- **Data and sources:**
  - OECD Revenue Statistics `OECD.CTP.TPS,DSD_REV_COMP_OECD@DF_RSOECD` (✅ NOR 2024 total tax/GDP **40.19**, OECD average 34.06).
  - OECD Taxing Wages `DSD_TAX_WAGES_COMP@DF_TW_COMP` (tax wedge by household type).
  - World Bank `GC.TAX.TOTL.GD.ZS` (✅, *central* government).
  - Eurostat `gov_10a_taxag` / `gov_10a_main` (✅ NO general government expenditure 2025 = 49.4% of GDP).
  - SSB national accounts (mainland GDP), SSB 07391 (taxes by type), and the petroleum tax split.
- **Model:** a *measure matrix* with rows {tax/GDP, tax/mainland GDP, tax excluding petroleum taxes / mainland GDP, tax wedge single at 100% AW, tax wedge one-earner couple + 2 children, top marginal rate, VAT standard rate, wealth tax yes/no} and columns {NOR, SWE, DNK, FIN, ISL, DEU, NLD, GBR, CHE, USA, OECD avg}. Each cell shows its source and tag. Also show the composition by tax type (OECD codes 1000 income, 2000 social security contributions, 3000 payroll, 4000 property, 5000 goods and services).
- **Visual:** "One country, eight numbers". Pick a measure and the country dot-plot reorders, with Norway's rank highlighted. A stacked composition bar per country. A short explainer card per measure (two sentences plus a methodology link).
- **MVP:** 4 measures (OECD tax/GDP, tax/mainland GDP from SSB, tax wedge, WB central-government tax) × Nordics + OECD, with the explainer text.

#### F3. **Partienes budsjettregnestykke**: party fiscal arithmetic (Partiene)
- **Question:** what do the parties' budget alternatives actually change, on the tax side and the spending side, and what is costed by whom?
- **Data and sources:**
  1. **Innst. 2 S** (finance committee recommendation on the national budget, each November). It contains each opposition party's alternative *rammeområde* totals and tax changes, and it's published via Stortinget `publikasjoner` (✅ the endpoint lists `innstilling` with HTML/XML formats; the per-table parsing is ❓ unverified).
  2. The parties' own **alternative budget documents** (PDFs on party websites each autumn; scrape the links into the registry by hand).
  3. **Finansdepartementet's answers to budget questions from the parties**, which are the official costings (*ESTIMATE*, publisher = Finansdepartementet).
  4. **Prop. 1 S / Prop. 1 LS** for the government proposal (baseline).
  5. The final **budget agreement** and Innst. 2 S vote results (Stortinget votes).
  6. Later: programme proposals with costs (F6 pipeline).
- **Model:** for each party, Δ vs. the government proposal by rammeområde (spending) and by tax type (revenue), the net effect on the structural non-oil deficit, and the share of measures with an official costing vs. uncosted. **No "responsibility" score.** Arithmetic only.
- **Visual:** a diverging bar chart per party (left = spending cuts / tax increases, right = spending increases / tax cuts), a waterfall from the government's proposal to each party's alternative, a click-through to measure tables with source links, and a toggle between "programme (4-year)" and "alternative budget (1-year)".
- **MVP:** budget 2027 (Prop. 1 S presented in **October 2026**, alternatives in **November 2026**): rammeområde totals per party from Innst. 2 S, hand-checked. This is a good hook to ship in December 2026–January 2027.

#### F4. **Hvem stemmer med hvem?**: party voting similarity (Stortinget)
- **Data and sources:** Stortinget `voteringer?sakid=` and `voteringsresultat?voteringid=` (✅; e.g. votering 28511 → 169 MP rows), `saker` (with `emne_liste` and committee), `emner` (✅ topic taxonomy), `komiteer` (✅ 16 for 2025–2026), `partier`, and `representanter` (✅). Per-MP votes go back to 2011–12.
- **Model:**
  - *Party position per vote* = the majority of its present MPs (for/against). Ties are dropped. Report party **cohesion** (Rice index) separately.
  - *Agreement* S_ij = (# votes where i and j take the same position) / (# votes where both have a position). Show it with n and a bootstrap CI.
  - Two scopes: **(a) recorded votes only** (`personlig_votering = true`), which are the contested ones, and **(b) all votes** using the vote's `voteringsforslag`/result to infer party positions where possible (❓ needs `voteringsforslag`/`voteringsvedtak` endpoint verification). Say clearly which scope is shown. Recorded votes oversample conflict.
  - Slices by emne (topic), committee, session, and government vs. opposition.
  - Research-grade extension: Bayesian ideal points (IRT/W-NOMINATE) for MPs, with uncertainty, as a separate "Lab" page.
- **Visual:** a heatmap matrix (sorted by hierarchical clustering), a 2D MDS map that animates by session, an MP page with "agrees with own party X%", and the most common cross-party coalitions ("A+H+FrP" style frequency table).
- **MVP:** the 2025–2026 session, recorded votes, the overall matrix plus 3 topic slices. Static JSON.

#### F5. **Hvor er Norge annerledes?** (Norge vs. verden)
- **Data:** ~300 harmonised indicators from OECD, Eurostat, World Bank, IMF WEO (✅ DataMapper), ILO (✅), WHO GHO (✅), OWID, V-Dem, QoG.
- **Model:** for each indicator, Norway's z-score / percentile vs. OECD members in the latest common year, with a coverage requirement (≥25 countries) and denominator-aware variants (mainland GDP where relevant).
- **Visual:** a ranked "outlier wall" (most unusual first) with a click-through to series comparisons.
- **MVP:** 50 indicators, a one-page ranking. A good chartbook teaser and a Phase 2 crowd-pleaser.

#### F6. **Fra løfte til lov**: the manifesto → vote → law tracker (Tracker)
- **Question:** what did parties promise, what did they propose and vote for in Stortinget, and what became law or budget?
- **Data and sources:**
  - **Promises:** 2025–2029 programmes (party sites; the overstortinget.no index lists all nine national programmes with page counts: Ap 180, FrP 125, H 100, KrF 86, MDG 112, R 106, Sp 140, SV 53, V 68 PDF pages). Older programmes (2013/2017/2021) from the **Sikt Partidokumentarkivet** (`parti.zip`, linked from polsys.sikt.no) and the **MARPOR** corpus (API key needed, ✅ endpoint answers). Government platforms (Hurdalsplattformen 2021 and later).
  - **Proposals and votes:** Stortinget `saker` (Dokument 8 representative proposals, Prop. L/S), `voteringer`, `voteringsresultat`, `voteringsforslag`, and `skriftligesporsmal`/`interpellasjoner` (✅, large and slow responses).
  - **Law:** **Lovdata public API** (✅ `https://api.lovdata.no/v1/publicData/list` gives bulk tarballs: *gjeldende lover* 5.8 MB, *gjeldende sentrale forskrifter* 21 MB, *Lovtidend avd. I* 2001–2025 69 MB plus the current year, updated daily, **NLOD 2.0**). Lovtidend includes the annual **skatte- og avgiftsvedtak**, which is useful for F2/F3 and the tax engine.
  - **Budget:** DFØ bevilgningshistorikk (appropriations voted per kap/post).
- **Model:** the *atomic promise* (see §3.3) is linked to evidence of type `proposal | vote | law | budget | statement`, each pointing at a primary document. Status ∈ {no recorded action, proposed, voted for, voted against, adopted in Stortinget, enacted (Lovtidend), partially, superseded}. Status is assigned by a human from the evidence chain. The model **suggests** candidate links (embedding similarity + emne + party + period), and a human confirms.
- **Visual:** per party, a stacked bar of promise statuses by policy area (government vs. opposition shown separately, because opposition parties can't enact anything). A promise card shows quote + page → candidate saker → votes (how the party voted) → law/budget, with dates on a mini timeline. A diff view of 2021 → 2025 programme positions per topic.
- **MVP:** 40–60 **concrete, verifiable** promises in **tax and welfare** from the governing party and the two largest opposition parties, hand-linked. Publish only verified links, with methodology up front. Don't scale this until the review workflow is proven.

### 1.6 Other strong pages (backlog)
Representative pages ("Min representant": votes, questions, committee, attendance); **Valg** (valgresultat.no results by municipality and krets, 2009→, on maps; turnout; swing); "Din kommune" (KOSTRA, eiendomsskatt via SSB 14155, local election results); **Partifinansiering** (income by source per party, 2008→); **Oljefondet** (NBIM holdings by country/sector, the fund vs. the budget transfer); **Sykefravær og uføre**; **Strømpris og magasin**; **Tidslinje over reformer** (§6.3). The full, source-mapped backlog is in §1.7.

### 1.7 Page backlog (from the five source hunts, 2026-10-03)
Every page lists the sources it needs (section numbers refer to `SOURCES.md`). **Effort:** **S** = about 1 Claude Code session once the adapter exists, or a trivial new adapter plus one page · **M** = 2–4 sessions · **L** = 5+ sessions, or blocked on keys, the Mac runner (SOURCES A1) or human review. Check marks follow SOURCES: ✅ verified · 🌐 reachable · 🔑 key · ❌ blocked from the box · ❓ unchecked. **QW** = quick win (see the list after the table).

| Universe | Page | Question it answers | Sources needed | Effort | Notes |
|---|---|---|---|---|---|
| **Økonomien** | **Norge i 200 år** (QW5) | How did Norway get rich, and was it before oil? | Maddison via OWID ✅ (§19d), Norges Bank HMS ✅ (house prices 1819→, CPI, stock index) (§2), SSB 13151 turnout 1829→ ✅ (§1b), events timeline. Later: IMF HPD ❓, WID ✅, PWT ❌ (manual), JST ✅ (NC, Lab only) | M | Reform markers: 1814, 1905, 1969, 1980s deregulation, 1990 fund law, 2001 fiscal rule, 2006 tax reform |
| Økonomien | **Hvor godt spår de?** forecast scorecard | IMF vs. OECD vs. Finansdepartementet: who forecasts Norway best? | IMF WEO/FM vintages ✅ (§19b), OECD EO 114–119 ✅ (§19a), SSB outturns ✅. Later: Nasjonalbudsjettet/Norges Bank MPR (❌ Mac) | M | A neutral accountability page. ESTIMATE/publisher vs. DATA |
| Økonomien | **Husholdningsgjelden vs. verden** (runner-up QW) | Do Norwegian households carry the world's heaviest debt service? | BIS WS_DSR/WS_SPP/WS_CREDIT_GAP ✅ (§19c), SSB 08726-series 🌐, Norges Bank LENDINGSURVEY 🌐, Gjeldsregisteret 🌐 | S | DSR 20.9 % (2026-Q1) |
| Økonomien | Hvem kjøper norsk gass og fisk? | Which countries depend on Norwegian exports, before and after 2022? | SSB 08799/08801 ✅, Eurostat Comext ✅, UN Comtrade preview ✅ (§19c) | S/M | Country-code crosswalk (579/578/NO/NOR) |
| Økonomien | Blir økonomien enklere? | Is Norway's economy getting less complex? | Atlas ECI ✅ (**CC BY-NC-SA**), SSB trade ✅, OECD TiVA ❓ | M | `publish: false` until the NC question is settled (SOURCES A3) |
| Økonomien | Konkursbølge? | Bankruptcies since 1980 against interest rates | SSB 09694/09695 ✅, Norges Bank ✅ | S | |
| **Staten** | **Statens balanse** | Is Norway rich, or is the state rich? | IMF GFS_BS ✅ + PSBS ✅ (§19b), SSB 08753 🌐, 07107 (1980M01→) 🌐, 03730 🌐 | M | Answers "why gross debt in an oil-fund state?" |
| Staten | **Oljefondet og deg** | From field to fund to boardroom: your share of the world and how the fund votes | Sodir FactPages/FactMaps ✅ (§11), NBIM holdings ✅ (§2), NBIM voting 🔑, Etikkrådet WP JSON ✅, DFØ ✅ | M (holdings) / L (votes) | Sankey from barrel to AGM vote |
| Staten | **Hvem får støtte?** (subsidies and næringsstøtte) | Where do subsidies and business support go, by kommune, industry and giver? | Støtteregisteret POST API ✅ (§4b), Innovasjon Norge CSV ✅, Forskningsrådet ✅, SSB 12639/12641 ✅, Brreg regnskap ✅ (§16). Later: Patentstyret 🔑 | M | Firms only; sole proprietors aggregated. Descriptive, no "effect of support" claims |
| Staten | **Statens postkasse** | How many documents and access requests each ministry handles, and the spikes | eInnsyn `/statistics` ✅ (§4b) | M | Organisations only, no person names |
| Staten | Offentlige innkjøp | Who wins public contracts? Single-bid rates | TED ✅, Doffin 🔑, OpenTender ❌ (NC) | M | |
| Staten | **Din kommune: kommunekassa** | Where does my municipality's money come from and go? | SSB 07022 ✅, 12367 ✅ (chunked), 14670 🌐, 13540-series 🌐, Grønt hefte ❌ (Mac) | L | The big municipal page. Needs the chunked SSB adapter |
| Staten | **Det skjulte budsjettet** | The transfers nobody debates, in kroner per resident | EU ETS registry 🌐 (§11), EEA Grants ✅, Norad IATI ✅ (§17), Havbruksfondet ✅, Statens eierberetning ❌ (Mac), SSB 12774/12940 🌐 | L | Each block can ship separately |
| **Skatt** | **Skattemiksen 1965–2024** (QW4) | Has the burden shifted from income to consumption? Which government level collects what? | OECD DF_REVNOR ✅ + DF_RSOECD ✅ (§19a) | S | Pairs with F2 |
| Skatt | **Hvem eier Norge?** (QW1) | How concentrated is wealth, and who carries the wealth-tax base? | SSB 10318 ✅, 08815 ✅ (§1b), OECD WDD ✅ (§19a). Later: WID ✅, SSB 05802 🌐 | S | Top 1 % 21.7 %, top 0.1 % 10.3 % (2024) |
| Skatt | **Hva sitter du igjen med av neste tusenlapp?** EMTR explorer | How much of an extra 1,000 kr do you keep? | OECD TaxBEN METR/PTR/NRR ✅ now. Later: our engine + Skatteetaten trekktabell 🌐 + NAV G API ✅ + SIFO ❓ | M (OECD) / L (engine) | External benchmark before the engine exists |
| Skatt | Grenselekkasjen | How much of the excise base leaks to Sweden, by county? | SSB 13983/14044/14221–14224 ✅. Later: Vinmonopolet salgstall 🔑/🌐 | S | |
| Skatt | Utbytteskatt i Norden | Combined corporate + dividend top rate vs. peers | OECD DF_CIT_DIVD_INCOME 🌐, DF_PIT 🌐 | S | |
| **Velferd** | **Ledighet i din kommune** (QW2) | Unemployment by municipality this month, as a map | NAV files ✅ (CC BY 4.0) (§3), Kartverket kommuneinfo ✅ | S | Monthly refresh; scrape links from NAV's statistics page |
| Velferd | Velferdsstaten i tall (upgrade) | Disability and sickness spending gross vs. net, vs. the Nordics | OECD SOCX 🌐 (net SOCX), Eurostat ESSPROS ✅ + COFOG L2 ✅, NAV ✅, SSB 13076/13077 🌐 | M | "Not causal" label next to the reform timeline |
| Velferd | Hva lever de av? | Income composition and poverty risk of uføre, AAP recipients and pensioners | SSB 13076–13095, 13680–13687, 13747–13755 🌐 (§1b) | S/M | |
| Velferd | Har G holdt følge? | G vs. prices and wages since 1967 | NAV G API ✅, SSB CPI ✅, SSB 09855 🌐 | S | |
| Velferd | Hvor ofte tar NAV feil? | Reversal rates by benefit | Trygderetten 🌐 (PDF), Sivilombudet 🌐 | M | |
| **Befolkningen** | Navnekartet | When did Emma and Muhammad peak? | SSB 10467/10501 ✅ | S | A traffic magnet |
| Befolkningen | Samemanntallet | Where the Sami electoral roll is growing | SSB 05926 + 14662/14663/14679 ✅ | S | Roll doubled 2005→2025 |
| Befolkningen | Sekulariseringen | Baptism share per municipality vs. KrF vote | SSB church tables ✅, valgresultat ✅ | S | |
| Befolkningen | Hvordan vi bruker dagen, 1970–2022 | Housework gender gap then and now | SSB 14320 ✅ | S | |
| Befolkningen | Utvandring da, innvandring nå | Emigrants per parish 1860–1920 vs. immigration today | Digitalarkivet 🌐, SSB ✅ | L | |
| **Offentlige tjenester** | **Smilefjes-kartet** (QW8) | Where are the worst kitchens? Chains vs. independents | Mattilsynet CSV ✅ (§5), Kartverket ✅, Brreg ✅ | S | Always show inspection date and re-inspections |
| Tjenester | **Din skole** | Bullying, results and teacher density per school | Udir Elevundersøkelsen API ✅, NSR ✅, Statistikkportalen 🌐, FHI nokkel ✅ (§8–9) | M | NLOD |
| Tjenester | **Helsekøen** | Did "ventetidsløftet" happen, per hospital? | Helsedir NKI 🔑, ventetider ❓, fastlegestatistikk ❓, FHI NPR ✅ | M/L | Plugs into the tracker |
| Tjenester | **Avstand til staten** | Distance to school, emergency hospital, police and bus for every resident | SSB 250 m grid ❓, Geonorge adresser ✅, NSR ✅, Entur GTFS ✅, police/hospital lists | L | The centralisation debate in numbers |
| Tjenester | Anmeldt vs. opplevd kriminalitet | Is the rise in reported crime real? | SSB 08484/08487/04876 ✅ | S | |
| Tjenester | Domstolene etter reformen | Processing times before/after the 2021 court mergers | Domstoladministrasjonen 🌐 | M | |
| **Energi, klima og natur** | **Hvem eier vannkraften?** (QW7) | Who owns Norway's hydropower: state, municipalities or private? | NVE kraftverk API ✅ (NLOD) (§11), Brreg ✅ | S | Owner orgnr → sector via Brreg |
| Energi | **Strømregningen din** | Total kr/kWh per municipality = price + nettleie + taxes − support | hvakosterstrommen ✅, ENTSO-E 🔑, NVE nettleie 🌐, Elhub ✅, Lovdata (support rules) | M | Behaviour in 2022 via Elhub |
| Energi | **Hvem eier havet?** | Quota concentration, landings, salmon licences, Havbruksfondet money | Fiskeridir frtyweb ✅, fangstdata ✅, Akvakultur API ✅, Havbruksfondet ✅ (§15) | L | ⚠ Person IDs hashed at ingest (A3). Reconcile with official totals |
| Energi | **Gårdsstøtten** (anonymised) | Does each jordbruksoppgjør really favour small farms? | Landbruksdir per-farm CSV ✅ (2013→) | M | Distributions only; sole proprietors unnamed |
| Energi | **Kysten i tall** | Cruise, shipping, lice and emissions along the coast | Kystdatahuset ✅, BarentsWatch 🔑, Miljødir ❓ | M | |
| Energi | Viltet og veiene | Wildlife killed by cars and trains per municipality since 1987 | SSB 03501, 06036 ✅. Later: NVDB ❌ | S | |
| Energi | Utslipp i din kommune | Real cuts or a plant closing? | Miljødir Excel ❓, norskeutslipp ❓ | S/M | |
| Energi | Rovdyr og beitedyr | Predator compensation vs. the vote | Rovbase 🌐, valgresultat ✅ | M | Coarsen locations |
| Energi | Gratiskvotene | Free ETS allowances per Norwegian plant | EU ETS registry 🌐 | M | |
| **Partiene** | **Lokaldemokratiet** | Kommunestyre composition since 1971, list demographics, personal-vote reordering | Sikt Kommunedatabasen ✅, valg.no XLSX ✅, valgresultat ✅, eInnsyn ✅ | M | Elected candidates named; lists aggregated |
| Partiene | **Ord vs. stemmer** | Does each party talk about what it votes on and proposes? | ParlaMint 5.0 ✅ + referat, Stortinget votes ✅, Dok 8 ✅, MARPOR 🔑 | L | CAP topics are already in ParlaMint |
| Partiene | Partiregisteret | How many parties register before each election, and which survive? | Partiregisteret ✅, Partifinansiering ✅ | S | |
| Partiene | Meningsmålinger (licensed) | Poll average vs. results | PolitPro 🔑 (attribution licence), Wikipedia 🌐 | M | Never scrape pollofpolls |
| Partiene | Hva mener velgerne? | Attitudes to taxes and spending by party voters | ISSP ❓, NCP/NES (Sikt) ❓, ESS (NC) 🌐 | L | Aggregates only |
| **Stortinget** | **Opposisjonens spørsmål** (QW3) | Who asks written questions, and which ministers answer slowest? | Stortinget `skriftligesporsmal` ✅ (§4c) | S | 2024–25: 3,234 questions, median 7.1 days, Ap 8 vs. FrP 807 |
| Stortinget | **Opposisjonens verktøykasse** (QW3 extended) | Dok 8 pass rates under majority vs. minority governments; ignored anmodningsvedtak | Stortinget saker/voteringer ✅, anmodningsvedtak tables ❌ (Mac) | M | Feeds F6 |
| Stortinget | **Hva snakker Norge om?** attention dashboard (runner-up QW) | Does media attention lead parliamentary attention? | DHLAB ✅, Wikimedia pageviews ✅ (CC0), ParlaMint ✅, questions ✅, eInnsyn ✅ | M (S for DHLAB + pageviews only) | |
| Stortinget | Interesseregisteret | MPs' registered interests vs. committee seats | Register PDF ✅ (+ community archive) | M | Editorial rules: show only what the register says |
| Stortinget | Svingdøra | Where departing ministers and state secretaries go | Karantenenemnda ❌ (Mac), Wikidata ✅ | M | Public role only |
| Stortinget | Lovverkstedet | The most-amended laws; election-year bursts | Lovdata Lovtidend ✅ | S/M | |
| Stortinget | Latter i salen | Chamber tone over time | Referat XML ✅ | S/M | Chartbook fun |
| Stortinget | EØS uten stemme | Share of EU acts incorporated without a Storting vote | EEA-Lex ❌ (Mac), ESA scoreboard 🌐 | M | |
| **Norge vs. verden** | **Norge på verdensrankingene** (QW6) | Where is Norway #1, and where is it slipping? | WGI ✅, TI CPI ✅, RSF ✅, UNDP HDI ✅, OECD PMR ✅ (§19–20) | M | Extension of F5. Show SE/methodology per index |
| Verden | **Norge for retten** | Where does the state get it wrong, and is it improving? | ECHR statistics files (PDF; HUDOC's web endpoint is not used), ESA/EFTA Court 🌐, Sivilombudet 🌐, Trygderetten 🌐, Riksrevisjonen grades 🌐, Regjeringsadvokaten 🌐 | L | Riksrevisjonen grades need LLM classification + review |
| Verden | EØS-midlene og bistanden | What Norway pays for abroad, per country and sector | EEA Grants API ✅, Norad IATI ✅ | M | |
| Verden | Tillit i Norden | Is Norway's trust drop unusual? | OECD Trust 🌐, DFØ Innbyggerundersøkelsen ❓, ESS (NC) 🌐 | M | |
| Verden | Norge i FN | Who Norway votes with at the UN | UNGA votes ✅ | M | |
| **Tracker / Tidslinje** | Anmodningsvedtak-sporing | Which Storting orders the government delivers | Stortinget vedtak ✅, Prop. 1 S tables ❌ (Mac) | M | |
| Tracker | Holder de ord 2009–2017 seed | Promise fulfilment then vs. 2025–2029 | HDO repos ❓, Stortinget ✅ | M | Validation set for F6 |

**Eight quick wins for the M2/M3 beta.** Each uses only open, ✅-checked sources, needs no key, no Mac runner and no person-level data, and builds on adapters that exist after M1 (SSB, OECD, OWID, WB, Stortinget) plus at most one small new adapter:
1. **QW1 Hvem eier Norge?** SSB 10318 + 08815 + OECD WDD. Wealth shares to the top 0.1 % and the wealth-tax base by asset. *S, M2.*
2. **QW2 Ledighet i din kommune.** NAV monthly CSV (CC BY 4.0) + Kartverket. Unemployment map with a monthly refresh. *S, M2 (new NAV adapter).*
3. **QW3 Opposisjonens spørsmål.** Stortinget `skriftligesporsmal`. Who asks, who answers, and how fast, per session. *S, M2.*
4. **QW4 Skattemiksen 1965–2024.** OECD DF_REVNOR + DF_RSOECD. Sixty years of tax mix by government level. *S, M3 (next to F2).*
5. **QW5 Norge i 200 år.** Maddison/OWID + Norges Bank HMS + SSB 13151. GDP, house prices and turnout from 1819/1820/1829. *M, M3 (new HMS xlsx adapter; confirm the HMS licence).*
6. **QW6 Norge på verdensrankingene.** WGI + TI CPI + RSF + HDI + OECD PMR. One standardised dashboard with trends. *M, M3 (small file adapters; confirm the RSF/HDI terms).*
7. **QW7 Hvem eier vannkraften?** NVE kraftverk API + Brreg. Ownership of 1,863 plants by sector and municipality. *S, M3 (NLOD both).*
8. **QW8 Smilefjes-kartet.** Mattilsynet CSV + Kartverket. Food-safety grades per municipality, with the date shown. *S, M2/M3 (confirm the NLOD statement).*

Runners-up: Husholdningsgjelden vs. verden (BIS), Hva snakker Norge om? (DHLAB + pageviews), Navnekartet (SSB), Viltet og veiene (SSB 03501).

---

## 2. Politics data in depth
Status legend: ✅ live-checked 2026-10-03 · ❓ not verified yet.

### 2.1 Stortinget open data (`https://data.stortinget.no/eksport/…?format=json`). No auth, 100 calls/min, NLOD 2.0, credit Stortinget.
| Dataset | Endpoint | Checked | Notes |
|---|---|---|---|
| Periods, sessions | `stortingsperioder`, `sesjoner` | ✅ | Current session **2026-2027**; current period 2025–2029 |
| Parties, counties (constituencies), topics, committees | `partier?sesjonid=`, `fylker`, `emner`, `komiteer?sesjonid=` | ✅ | `emner` (26 KB) is Stortinget's topic tree, so **reuse it as the backbone of our policy taxonomy**. `fylker` = **electoral districts**: old counties, not the 2024 counties |
| Representatives | `representanter?stortingsperiodeid=2025-2029`, `dagensrepresentanter`, `personbilde?personid=` | ✅ | Includes substitutes; photos available (check reuse terms per image) |
| Cases | `saker?sesjonid=` | ✅ | 663 in 2025-2026 (1.8 MB). Integer enums (`status`, `type`, `dokumentgruppe`); `emne_liste`, `komite`, `henvisning` (e.g. "Dokument 3:18 (2025–2026)") |
| Votes | `voteringer?sakid=` | ✅ | `personlig_votering`, `antall_for/mot` (−1 if not recorded), `votering_tema` |
| Per-MP results | `voteringsresultat?voteringid=` | ✅ | Only for recorded votes. Available from 2011–12 |
| Proposals and decisions in a vote | `voteringsforslag?voteringid=`, `voteringsvedtak?voteringid=` | ❓ | Needed to infer party positions in non-recorded votes and to match promises |
| Questions | `skriftligesporsmal?sesjonid=`, `sporretimesporsmal?…`, `interpellasjoner?…` | ✅ | **Large and slow**: written questions >2.8 MB and >30 s for one session, so use a 120 s timeout and stream to disk. Spørretime 1.6 MB / 19 s |
| Hearings | `horinger?sesjonid=` | ✅ | 351 in 2025-2026 (394 KB) |
| Meetings | `moter?sesjonid=` | ✅ | |
| Publications | `publikasjoner?publikasjontype=referat\|innstilling\|…&sesjonid=`, `publikasjon?publikasjonid=` | ✅ | **Debate transcripts (referat) are available as XML** with `<Hovedinnlegg>`/speaker structure (e.g. `refs-202526-01-06`, 192 KB). That opens speeches/debate text analysis. Innstillinger are also listed (220 KB index, 19 s) |
| Biographies | `kodetbiografi?personid=` | ❓ | Education/career, useful for MP pages |

Gotchas: .NET dates (`/Date(ms+0200)/`), integer enums that need official mapping tables, slow big endpoints, and electoral districts ≠ current counties.

### 2.2 Elections: Valgdirektoratet (`https://valgresultat.no/api`) ✅
- A HAL+JSON API with no auth. The root lists elections: **2009 st; 2011 fy/ko; 2013 st/sa; 2015 fy/ko; 2017 st/sa/ko; 2019 fy/ko; 2021 st/sa; 2023 fy/ko; 2025 st/sa** (st = Storting, fy = county, ko = municipal, sa = Sameting).
- Hierarchy: `/2025/st` (national: votes, %, change, seats, levelling seats per party, turnout, early vs. election-day votes) → `/2025/st/03` (electoral district) → `/2025/st/03/0301` (municipality) → `/2025/st/03/0301/1` (**krets/bydel level**). Navigate via `_links.related`.
- `Cache-Control: public, max-age=15`. Licence ❓ (likely NLOD, verify on valg.no). Older elections (pre-2009): SSB election tables, Sikt PolSys and the Sikt valglistearkiv (candidate lists since 1921).
- Gotchas: municipality codes change with reforms (2020, 2024). Join via SSB Klass crosswalks with `valid_from/valid_to`.

### 2.3 Party programmes 2013 / 2017 / 2021 / 2025
**Where to get them:**
1. **Party websites** for the current 2025–2029 programmes (PDF). overstortinget.no indexes all nine with page counts (checked 14 Sept 2026, per that site). Older programmes often disappear from party sites, so fall back to the **Wayback Machine** and record the snapshot URL.
2. **Sikt Partidokumentarkivet** (polsys.sikt.no → *Partidokumentarkivet*): Norwegian party documents **1884 → present**, including programmes, as **one ZIP** (`https://www.nsd.no/data/individ/publikasjoner/Partidokumentarkivet/parti.zip` is the link on the Sikt page; the download HEAD timed out from the box ❓). Use it as the canonical historical text source. Terms ❓, so check before republishing full texts. Quoting short spans with citation is fine.
3. **MARPOR / Manifesto Project** (`https://manifesto-project.wzb.eu/api/v1/…`): ✅ `list_core_versions` answers without a key, and data endpoints redirect to `not_authorized` without one, so you need a **free API key** (register). It covers Norwegian national manifestos coded since 1945 (country 12), with **quasi-sentence annotations** for recent elections, RILE and per-category shares. Terms: academic/non-commercial with citation ❓. Use it as an **external benchmark** for our extraction and taxonomy, and as the long-run left-right series.
4. The Sikt **chatbot over the party archive** exists (linked from polsys). Note it as prior art, not a data source.

**LLM extraction pipeline (atomic proposals):**
```
PDF ─► text per page (pdftotext -layout; OCR fallback for scans) ─► page-anchored text store (documents, pages)
   ─► segmentation into candidate statements (rule-based: bullets, "Vi vil …", "Partiet vil …", numbered lists)
   ─► LLM pass 1 (local qwen3:8b, JSON-schema constrained): is_pledge?, verbatim quote span, policy area (Stortinget emne), action verb
   ─► LLM pass 2 (stronger model on candidates): structured fields (object, direction, parameter, value, unit, target group, timing, quantified?)
   ─► automatic verification: quote must string-match the page text (normalised); numbers in fields must appear in the quote
   ─► dedupe/cluster within party (near-duplicates across chapters)
   ─► human review queue (accept / edit / reject; 2nd reviewer on a 10% sample)
   ─► publish only `verified`; keep model/prompt/version on every row
```
**Taxonomy:** level 1 = Stortinget `emner` (official and neutral); level 2 = our policy instrument {tax, spending, regulation, organisation, rights, symbolic}; plus `parameter` links into the tax engine or budget chapters where relevant. Map to MARPOR categories as a secondary code for comparability.

**Manifesto diffing (2021 → 2025):** per party and topic, align pledges by embedding similarity plus human confirmation, then classify each as {new, dropped, strengthened, weakened, reversed, unchanged}. Visual: a per-party "what changed" list with quotes side by side. Diff at the **pledge** level, not the text level. Text diffs of reformatted PDFs are noise.

### 2.4 State budget and accounts
| Source | Use | Access | Checked |
|---|---|---|---|
| **DFØ statsregnskap** | Actual central-government spending and revenue by kap/post/art/agency, monthly, 2014→ | `https://statsregnskapet.dfo.no/last-ned` → `/nedlasting/statsregnskapet_aar_YYYY.zip`, `_hittil_i_aar.zip`, `_siste_maaned.zip`, `SRS_` variants; full history CSV (50 MB zipped / 1.5 GB unzipped); bevilgningshistorikk CSV. NLOD | ✅ (zip 668 KB, CSV **semicolon-separated, Windows-1252/Latin-1 encoding, decimal comma**, `Periode` = `YYYYMM`) |
| **Prop. 1 S** (each ministry) + **Gul bok** | The government's proposed budget per kap/post, narrative measures | regjeringen.no PDFs/HTML; statsbudsjettet.no tables | ❌ regjeringen.no **403** from the box (bot protection). Fetch from Egil's Mac, or use DFØ bevilgningshistorikk for the numbers |
| **Prop. 1 LS** (Skatter, avgifter og toll) | Tax rule changes, revenue effects (provenyvirkning), **example tax calculations for typical households** (golden tests!) | regjeringen.no | ❌ same 403 |
| **Innst. 2 S** + budget innstillinger | Opposition alternatives (rammeområder), the final agreement | Stortinget `publikasjoner?publikasjontype=innstilling` | ✅ list; ❓ table parsing |
| Party alternative budgets | Full party alternatives and tax packages | Party websites (PDF), each Oct–Nov | ❓ manual registry |
| Finansdepartementet answers to party budget questions | Official costings of party proposals (ESTIMATE) | regjeringen.no | ❓ |
| SSB 07107, 07391, 14669 | Fiscal account principal items monthly, taxes by type, COFOG | SSB v2 | ✅ |

### 2.5 Law: Lovdata
- **Open:** the Lovdata API public data (`https://api.lovdata.no/v1/publicData/list` ✅, `…/get/<file>`). It has *gjeldende lover*, *gjeldende sentrale forskrifter* (consolidated, daily), and *Norsk Lovtidend avd. I* 2001→ (official announcements, including **skatte-, avgifts- og tollvedtak**). Format: XML-compatible HTML with chapter/section structure. **NLOD 2.0**; credit Lovdata.
- **Not open:** court decisions, commentary, local regulations (Lovtidend avd. II only partly), and anything via systematic scraping of lovdata.no (prohibited by its terms; use the API).
- **Use:** an `events` timeline (law in force, amendments) and links from tracker promises to enacted changes. LAW-tag citations for tax parameters (Stortingets skattevedtak for year *t*).

### 2.6 Hearings (høringer)
regjeringen.no høringer (government consultations): ❌ 403 from the box, so plan for a polite fetch from Egil's Mac or a browser-based fetch; check the robots/terms. Stortinget hearings ✅ (`horinger`). Use: link proposals to consultations, and count consultation responses by organisation type (later).

### 2.7 People and offices: Wikidata ✅
- SPARQL at `https://query.wikidata.org/sparql` (set a descriptive User-Agent). ✅ A test query counted **3,600** people with position held = member of the Storting (Q9045502).
- Use: stable IDs and cross-links (Stortinget ID, Wikipedia, birth year, education, ministerial posts, party history), and cabinets/governments with dates (cross-check v1's `political-timeline.json`). CC0.
- Gotcha: incomplete qualifiers (start/end dates, parliamentary group), so treat it as enrichment, never as the source of truth for votes or seats.

### 2.8 Polls: pollofpolls.no
✅ The site is reachable. It offers **HTML tables plus RSS feeds** (`rss_maling.php`), **no API**, and **no open licence found** on the "Om" page. Individual polls belong to the commissioning media/pollsters. **Don't scrape and republish** without written permission. Options: (a) ask pollofpolls for permission or a feed (Egil's call; that's an external contact); (b) show only Riksdata's own average computed from polls published under open terms (rare); (c) link out. For the MVP, link out and show no poll numbers. **New option (track B):** the **PolitPro API** (Bearer token, free registration) allows displaying its Norwegian poll series with attribution and a link, as long as we don't build a competing standalone poll platform. Wikipedia's polling tables (CC BY-SA) are a fallback. See SOURCES §4a and A2.

### 2.9 Party finances: Partifinansiering.no ✅
Annual Excel files on the front page: **"Alle regnskapstall 2008 … 2025.xlsx"** (party accounts at all levels) plus **"Valgkampbidrag"** files (campaign contributions). Licence ❓ (public register; likely NLOD). Use: party income by source (state support, membership, private contributions above the threshold), per party and year. SSB also publishes party-finance statistics ❓.

### 2.10 Research data behind the politics layer (Sikt)
- **Norsk valgundersøkelse** (Norwegian National Election Studies, ISF), via Sikt: individual-level surveys since 1957. **Application/registration required, no redistribution of microdata.** Use only for aggregated, cited analysis in the Lab section.
- **Norsk medborgerpanel** (Sikt): the same terms.
- **PolSys** (Sikt): Storting composition since 1814, governments, party database, valglistearkiv. Use as the historical backbone, with terms ❓.

### 2.11 Prior art to learn from (not to copy)
overstortinget.no (2025–2029 programme search + "Spør Stortinget" Q&A), holderdeord.no (promise tracking, earlier periods; status ❓), pollofpolls.no, valgresultat.no, SSB's "Statistikk og politikk" pieces, and the Comparative Pledges Project literature (pledge-fulfilment methodology).

---

## 3. Data model extensions
These extend PLAN.md §4 without changing the time-series core. Everything joins through **entity IDs** and **series IDs**.

### 3.1 Epistemic tags (four, plus provenance)
| Tag | Meaning | Required provenance |
|---|---|---|
| `DATA` | An observed statistic from a publisher | source, table/series ID, vintage |
| `LAW` | A statutory rule or parameter in force | legal source (Lovtidend/Lovdata ID or Stortingsvedtak), valid_from/valid_to |
| `ESTIMATE` | A quantitative estimate. `estimate_by` = `publisher` (e.g. Finansdepartementet, SSB projection, IMF WEO forecast) or `riksdata` (our model) | estimator, method/assumptions link, date |
| `PROPOSAL` | A proposed rule, parameter or spending change by a party/government | document + page, party, period, verification status |

*(PLAN.md previously had a fifth tag, MODEL. It's folded into `ESTIMATE` with `estimate_by = riksdata`, so the public UI shows exactly four tags. See the PLAN.md change list.)*

### 3.2 Entities (single table, typed, time-valid)
```
entities(entity_id PK, entity_type, name_no, name_en, valid_from, valid_to, parent_id,
         iso3, ssb_code, klass_version, stortinget_id, wikidata_id, orgnr, extra JSON)
```
| entity_type | ID scheme | Source of truth |
|---|---|---|
| country / aggregate | `NOR`, `SWE`, `OECD`, `EU27`, `WORLD` | ISO 3166-1 alpha-3 |
| county (fylke) | `NO-F-<ssbcode>@<version>`, e.g. `NO-F-03` | SSB Klass (county classification), time-valid |
| municipality | `NO-K-<4digit>`, e.g. `NO-K-0301` | SSB Klass (municipality classification), with crosswalks for 2020/2024 |
| electoral district | `NO-V-<stortinget fylke id>` | Stortinget `fylker` / valgresultat (old 19 counties!) |
| krets / bydel | `NO-K-0301-<krets>` | valgresultat |
| party | `party:<stortinget id>`, e.g. `party:A`, `party:H`, `party:FrP` | Stortinget `partier`; Wikidata for history |
| person | `person:<stortinget id>`, e.g. `person:HASABD`; non-MPs `person:wd:Q…` | Stortinget, Wikidata |
| committee | `committee:<id>`, e.g. `committee:KONTROLL` | Stortinget `komiteer` |
| government (cabinet) | `gov:<slug>`, e.g. `gov:store-ii` | Wikidata + v1 timeline |
| organisation / agency | `org:<orgnr>` | Brreg |

`entity_links(from_id, to_id, relation, valid_from, valid_to, source)` stores relations such as person→party (membership), person→committee, party→government, municipality→county.

### 3.3 Policy proposals
```
documents(doc_id PK, doc_type[programme|alt_budget|platform|prop|innst|referat|law|other],
          party_id, title, period, published, url, archive_url, sha256, pages, licence)
pages(doc_id, page_no, text)                       -- page-anchored text, the verification target
proposals(proposal_id PK, doc_id, page_no, quote, party_id, period,
          emne_id, instrument[tax|spending|regulation|organisation|rights|symbolic],
          action[introduce|increase|decrease|abolish|maintain|study|other], object,
          parameter_ref NULL,                       -- e.g. tax:ordinary_income_rate, budget:kap0571
          current_value NULL, proposed_value NULL, unit NULL,
          quantified BOOL, target_group NULL, timing NULL,
          cost_estimate NULL, cost_estimate_by NULL, cost_source NULL,
          marpor_code NULL,
          extraction_model, extraction_prompt_ver, verify_status[unverified|verified|rejected],
          verified_by, verified_at, tag='PROPOSAL')
proposal_evidence(proposal_id, evidence_type[proposal|vote|law|budget|statement],
                  ref_id, relation[supports|contradicts|partial], note, linked_by, linked_at)
proposal_lineage(proposal_id, prev_proposal_id, change[new|dropped|strengthened|weakened|reversed|unchanged])
```

### 3.4 Votes (from Stortinget)
```
st_cases(case_id, session_id, title, short_title, type, status, document_group, reference,
         committee_id, emne_ids[], proposers[], updated_at)
st_votes(vote_id, case_id, time, topic, personal BOOL, n_for, n_against, n_absent, result)
st_vote_proposals(vote_id, proposal_ref, text, proposing_parties[])   -- voteringsforslag
st_vote_results(vote_id, person_id, party_id, district_id, vote[for|mot|ikke_tilstede], is_substitute)
st_party_positions(vote_id, party_id, position[for|mot|split|absent], n_for, n_against)   -- derived
```
Derived series written back to `series/observations` with tag `ESTIMATE` (`estimate_by = riksdata`), for example `riksdata.st.agreement.A__H` (entity = party pair, period = session) and `riksdata.st.cohesion.A`.

### 3.5 Budget lines
```
budget_lines(year, stage[proposed|voted|revised|accounts], kap, post, kap_name, post_name,
             ministry_id, programomraade, programkategori, amount_nok, source_doc, vintage, tag)
     -- stage=proposed  ← Prop. 1 S        (tag PROPOSAL, entity gov:…)
     -- stage=voted     ← bevilgningshistorikk / Innst. (tag LAW: appropriation decision)
     -- stage=accounts  ← DFØ statsregnskap (tag DATA)
alt_budget_lines(year, party_id, rammeomraade|kap, delta_vs_gov_nok, source_doc, page, tag='PROPOSAL')
cofog_map(kap, post, cofog_code, weight, method)   -- our mapping (ESTIMATE/riksdata), documented
```

### 3.6 Events and reforms
```
events(event_id, date, event_type[law_in_force|budget|reform|election|government_change|shock],
       title, description, entity_id, source_doc, lovdata_id NULL, related_series[] , tag)
```
These drive chart annotations, the reform timeline, and the before/after tooling (§6.3).

**How it all joins:** `series.entity` ↔ `entities`; `proposals.parameter_ref` ↔ tax-engine parameters and `budget_lines.kap/post`; `proposals.emne_id` ↔ `st_cases.emne_ids`; `proposal_evidence.ref_id` ↔ `st_votes.vote_id` / `documents.doc_id` / Lovdata IDs; `events.related_series` ↔ `series.series_id`. Everything is Parquet tables with DuckDB views. The site gets pre-joined JSON.

---

## 4. Tax and benefit engine
### 4.1 Approach (opinionated)
- **Parameters as data:** `registry/tax/parameters/*.yaml` in **OpenFisca-style dated values**:
  ```yaml
  trinnskatt:
    thresholds:
      values: {2026-01-01: [226100, 318300, 725050, 980100, 1467200]}
      metadata: {unit: NOK, reference: "Stortingets skattevedtak 2026 § …", lovtidend: "LTI-…", tag: LAW}
    rates:
      values: {2026-01-01: [ ... ]}   # fill from the skattevedtak; never from memory
  ```
  Every value carries a legal reference (Lovtidend skattevedtak via the Lovdata API, cross-checked with **Prop. 1 LS** and Skatteetaten's published rates).
- **Engine:** a small home-grown Python package `riksdata.tax` (pure functions, vectorised with numpy/polars) with formulas per variable and a `Reform` type that is a parameter overlay (YAML patch) plus optional formula overrides. **Why not openfisca-core directly?** There's no Norwegian OpenFisca country package to build on, and our site is static. A browser calculator needs a client-side implementation anyway, and openfisca-core's weight isn't justified for ~30 formulas. **Why the OpenFisca format?** So that migration to openfisca-core / policyengine-core stays possible if we ever do full microsimulation.
- **Browser:** a TypeScript port of the same formulas, generated or hand-ported, with the **same golden test cases** (`tests/tax/golden/*.json`) run in both pytest and vitest. CI fails if they diverge.

### 4.2 Scope order
1. **Wage earners and pensioners, personal income tax** (2024–2027): alminnelig inntekt rate, minstefradrag, personfradrag, trinnskatt, trygdeavgift, standard deductions (interest, union fees), Finnmark/Nord-Troms rules (later). Outputs: net income, average and **marginal** rates over an income grid.
2. **Employer side and tax wedge:** arbeidsgiveravgift (by zone) → total labour cost. **Validate against the OECD Taxing Wages Norway figures** (e.g. single at 100% AW); our engine should reproduce OECD's wedge within rounding. That's a strong external check.
3. **Wealth tax:** municipal + state rates, bunnfradrag, valuation discounts (primary/secondary housing, shares/working capital), debt reduction rules.
4. **Capital income:** shareholder model (oppjusteringsfaktor), skjermingsfradrag.
5. **Benefits and EMTR:** barnetrygd, kontantstøtte, bostøtte (Husbanken), childcare price caps / moderation schemes, taxation of AAP/uføretrygd/alderspensjon. Then the **effective marginal tax rate** curves per household type, which is where the kinks show up.
6. **Indirect taxes** (VAT/excise) by household type, using SSB consumption survey shares (later, ESTIMATE).

### 4.3 Validation
- **Golden cases:** 40–60 households × years. Sources: (a) **Prop. 1 LS example calculations** (the ministry publishes tax for typical incomes year over year), (b) **Skatteetaten's skattekalkulator**, with Egil entering cases by hand and saving the outputs with a date (no scraping; there's no public calculation API), (c) **OECD Taxing Wages** country results.
- Property tests: monotonicity of net income in gross income (except at known benefit cliffs), continuity at thresholds, a zero-tax region below personfradrag + minstefradrag.
- Every engine release documents which golden sets pass. The calculator page shows "Validated against: Prop. 1 LS 2026 examples, Skatteetaten kalkulator (n cases, dd.mm.yyyy)".

### 4.4 Running party proposals through it
1. A tax `PROPOSAL` with `parameter_ref` (e.g. `tax:wealth.threshold`) becomes a `Reform` overlay.
2. Run it on (a) a **household grid**, which gives winners/losers by income and household type (MODEL → `ESTIMATE/riksdata`), and (b) **aggregate revenue**. Prefer the published costing (Finansdepartementet's answers, Prop. 1 LS proveny tables) as `ESTIMATE/publisher`. Show Riksdata's static estimate only alongside it, built from SSB income/wealth distribution tables (deciles/percentiles), with assumptions stated and no behavioural response.
3. Never present a single "cost" without saying who estimated it and how.
4. Microdata (microdata.no via Sikt) could enable proper microsimulation as research. Output rules apply (no individual-level publication). Treat it as Lab/research, not core.

---

## 5. AI usage
### 5.1 Where LLMs help
| Task | Value | Model / where |
|---|---|---|
| Manifesto pledge detection + field extraction | Very high: it turns 1,000 PDF pages into a database | Pass 1 local **qwen3:8b** (Ollama, `format` JSON schema, temperature 0, `/no_think` for speed) on Egil's Mac. Pass 2 or hard cases with **Claude** (inside Claude Code sessions on the Max plan) |
| Gold-set creation and adjudication | High: the evaluation backbone | Egil + Claude Code (Claude suggests, Egil decides) |
| Classifying cases/questions to emner and instruments | Medium (Stortinget already tags emner) | qwen3:8b, cheap and repeatable |
| Budget-measure extraction from Prop. 1 S narrative | Medium. **Prefer structured sources** (DFØ, Gul bok tables) and use LLMs only for the measure lists in the text | qwen3:8b first pass + human check |
| Candidate linking promise → sak/vote/law | High (search-space reduction) | Embeddings (a local multilingual model via Ollama, e.g. `bge-m3`, ❓ check availability) + rules; a human confirms |
| Writing code, adapters, tests | Very high | Claude Code (Max) |
| Q&A over the lake | Nice-to-have, risky for neutrality | Last. Text-to-SQL that **always shows the SQL, the rows and the sources**; no free-text answers without citations |

**Plan constraint:** Claude Max covers interactive Claude Code use. **Bulk programmatic API calls need an Anthropic API key (pay-per-use)**, which is a separate decision for Egil. So the reproducible pipeline is designed to run **locally on qwen3:8b**, with Claude used interactively for gold sets, adjudication and the hard tail. Every extracted row records `extraction_model` and `prompt_version`, so re-runs are comparable. qwen3:8b caveats: decent but imperfect Norwegian (bokmål/nynorsk mix in programmes), ~32k native context (so chunk per page or section), and noticeably weaker on implicit pledges. That's fine for pass 1 with high recall.

### 5.2 Guardrails
1. **Quote-or-reject:** every extracted item must include a verbatim quote and a page number. An automatic string match against `pages.text` must pass, or the item is discarded.
2. **Numbers must be in the quote:** any `proposed_value` must appear in the quote text.
3. **No LLM-generated numbers in DATA/LAW.** LLMs never produce statistics or parameters. They only locate them in documents.
4. **Human review before publish.** Public pages show only `verified` items (or clearly labelled "maskinforslag, ikke kontrollert" in an opt-in view).
5. **Symmetry:** the same prompts, the same pipeline and the same review depth for every party. Report per-party extraction recall on the gold set to detect bias.
6. **Versioning:** prompts live in git, model and version are stored per row, and re-extractions produce diffs, not silent overwrites.

### 5.3 Evaluation
- **Gold set:** ~300–500 pledges hand-annotated across at least 4 parties and 2 periods (2021, 2025), spanning tax, health, climate and immigration.
- **Metrics:** pledge detection P/R/F1 (span overlap ≥ 0.5), emne classification macro-F1, instrument/action accuracy, parameter exact match, quote-verification pass rate, and per-party recall parity.
- **Agreement:** Egil vs. a second annotator (or Claude as a second coder with adjudication). Report Cohen's κ.
- **External benchmark:** MARPOR quasi-sentence codes for the same Norwegian manifestos, i.e. agreement of our taxonomy and MARPOR's after mapping.
- Model comparison: qwen3:8b vs. Claude vs. rules-only baseline. This is publishable (see §7.3).

---

## 6. Neutrality, credibility and "what worked"
### 6.1 Principles
1. **Source every number** (publisher, table/endpoint, retrieval date, licence) on the page itself, not only in the methodology.
2. **Methodology page per flagship:** definitions, data, transformations, known limitations, and the code path (links to the adapter and SQL).
3. **Vintages:** keep raw by date, publish dated releases (GitHub Releases, with a Zenodo DOI later), and show "data as of" on every chart. Revisions are visible ("SSB revised 2024 GDP on …").
4. **Corrections log:** a public `CORRECTIONS.md` and `/korreksjoner` page with date, what was wrong, the impact and the fix. Errors are fixed openly, not silently.
5. **No party scoring.** No "most responsible", "most liberal" or "best". Arithmetic, positions and evidence only. Ideal-point maps are labelled as statistical summaries of votes, not ideology verdicts.
6. **Symmetry:** every party gets the same template, the same depth and the same order rules (seat count or alphabetical, fixed). Government vs. opposition differences are structural (only the government can enact), so they're shown separately.
7. **Neutral language:** use official terms (e.g. "formuesskatt", "arbeidsinnvandring") and avoid campaign framing.
8. **Privacy:** person-level data only for people acting in public office (MPs' votes, questions, speeches). **No use of skattelister** (public tax lists are login-gated and logged, and mass collection is prohibited), and no survey microdata republication. The binding, consolidated rules (aggregate person-level registers, hash person IDs at ingest, no scraping of Finn/lovdata.no/pollofpolls, NC licences vs. ads) are in **SOURCES.md Appendix A3**.
9. **Right of correction:** a visible "Meld feil" link, and parties/ministries can flag errors. (Whether to proactively contact parties is Egil's call.)
10. **Election-time discipline:** freeze new politics features in the two weeks before an election. Only data refreshes and corrections go out.

### 6.2 Licences and attribution
Respect per-source terms (`SOURCES.md`). Non-redistributable sources (polls, MARPOR raw, survey microdata) can feed **private** analyses in the lake (`publish: false`) and only published aggregates with citation. **NC/SA licences** (ESS CC BY-NC-SA 4.0, JST, Atlas ECI, OpenTender, WHO GHO, MARPOR) can't appear on a site with ads or commercial use. Keeping riksdata.org ad-free is therefore a licensing decision as well as a design one (Egil's call).

### 6.3 "What has worked and what hasn't": linking reforms and promises to outcomes
This is the most tempting and the most dangerous feature, so build it in three tiers:
1. **Process tracking (safe, core):** promise → proposal → vote → law → budget. This measures **whether** things were done, not whether they worked. It's the F6 tracker.
2. **Descriptive before/after (core, carefully labelled):** the `events` reform timeline (from Lovdata in-force dates, budgets and Stortinget decisions) is overlaid on outcome series. Show pre/post levels and trends with ranges, label them **"Beskrivende, ikke årsakssammenheng"**, and always show comparator countries (Nordics) and a longer window so readers see pre-trends and shocks (oil prices 2014, COVID 2020, energy prices 2022).
3. **Quasi-experimental analyses (Lab, research-grade, opt-in):** only where there's real variation in timing or exposure:
   - **Municipal staggered adoption**: e.g. introduction/abolition of eiendomsskatt (SSB 14155), local pilots, the kommunereform mergers (2020), using KOSTRA panels and modern staggered DiD (Callaway–Sant'Anna / Sun–Abraham) with event-study plots and pre-trend tests.
   - **National reforms**: synthetic control with OECD comparators (e.g. EV incentives → EV share; tax changes → revenue composition), with placebo-in-space/time tests.
   - **Prefer curating published evaluations** (SSB Discussion Papers, Frisch Centre, Statistics Norway reports, NOU evaluations, Riksrevisjonen audits, NHH/BI/UiO papers) as `ESTIMATE/publisher` entries linked to the reform event, over producing our own causal claims.
   - **Every Lab analysis** gets a pre-written design note (what would falsify it), shows its robustness checks, and uses causal language only when the design supports it. Nothing here appears on front pages as a headline claim.

---

## 7. Roadmap (Oct 2026 → Oct 2027)
Ordered so something visible ships early, and timed around **budget season (Oct–Dec 2026)** and the **municipal and county elections (September 2027)**. Egil's capacity is assumed at about 1–2 Claude Code sessions per week alongside the PhD.

| Milestone | When | Builds | Demo-able outcome |
|---|---|---|---|
| **M1: Pipeline** (Phase 1) | Oct 2026 (3 weekends) | uv package, registry, SSB/OWID/WB/OECD/Stortinget adapters, Actions refresh, releases | `riksdata sql` over a nightly-refreshed lake. First data release `data-2026-10-xx` |
| **M2: v2 beta site** (Phase 2a) | Nov 2026 | Astro site, Explorer (search + series page + compare + transforms), "Norge 2026" front page (24 tiles), 3 chartbook pages + quick wins QW1–QW3 and QW8 (§1.7), deployed at `riksdata.org/beta/` (v1 stays at `/`) | **A public beta link** with SSB+OWID+OECD+WB, the first thing to show people |
| **M3: Staten & Skatt** (Phase 2b) | Dec 2026 – Jan 2027 | DFØ + bevilgningshistorikk adapters, `budget_lines`, **F1 Hvor går 1000 kroner**, **F2 Skattetrykk**, F5 outlier wall MVP, quick wins QW4–QW7 | Two flagships live, and v2 replaces v1 at `/` (v1 moves to `/v1/`) |
| **M4: Stortinget** (Phase 3a) | Feb – Mar 2027 | Full Stortinget model (cases, votes, results, questions, committees, referat index), entities + Wikidata, valgresultat.no elections + Kartverket maps, **F4 voting similarity**, MP pages | "Hvem stemmer med hvem" plus election maps |
| **M5: Tax engine v1** (Phase 3b) | Mar – May 2027 | `riksdata.tax` wage earner 2024–2027 + employer side, golden tests (Prop. 1 LS, kalkulator, OECD wedge), TS port, calculator + marginal-rate curves | **"Skattekalkulator med kilder"**, with the OECD tax wedge reproduced |
| **M6: Party data** (Phase 4a) | May – Jul 2027 | documents/pages store, extraction pipeline (qwen3:8b + review), gold set + evaluation, 2025–2029 programmes (tax and welfare first), **F3 party fiscal arithmetic** (budget 2027 alternatives from Innst. 2 S), tax proposals → engine | Party pages with verified proposals and arithmetic |
| **M7: Tracker** (Phase 4b) | Aug – Sep 2027 | **F6 promise → vote → law** MVP (40–60 verified promises), 2021→2025 manifesto diff, Lovdata events timeline, Partifinansiering | Live **before the September 2027 local elections** (respect the 2-week freeze) |
| **M8: Depth** (Phase 5) | Oct 2027 → | Wealth tax + benefits + EMTR, budget 2028 live coverage, historical manifestos 2013/2017 via Sikt/MARPOR, Lab page (DiD/synthetic control), Q&A experiment | "Budsjett 2028 på Riksdata", the yearly ritual |

### 7.1 What not to do early
No Q&A bot, no ideal-point models, no causal claims, and no scraping of non-API sites from CI. Don't extract all nine programmes before the gold-set evaluation is done.

### 7.2 Effort reality check
M1–M3 are mostly engineering that Claude Code does well. M6–M7 are bottlenecked by **human verification time** (estimate 2–4 minutes per promise including linking, so 60 promises ≈ 3–4 hours; 1,000 pledges ≈ 40+ hours). Plan the review UI accordingly (a simple local Streamlit or Datasette page over DuckDB).

### 7.3 Research-grade pieces (could tie to the PhD or become papers, without overreaching)
1. **Data descriptor paper:** "Riksdata: linked open data on Norwegian manifestos, parliamentary votes and fiscal outcomes" (e.g. *Scientific Data*, *Data in Brief*, *Research & Politics*). Low risk, and a natural by-product of M4–M7.
2. **LLM pledge extraction benchmark for Norwegian:** local 8B vs. frontier vs. rules, evaluated against a human gold set and MARPOR codes. Fits an ML methods angle (a workshop paper, e.g. NLP+CSS).
3. **ML-in-finance tie-in (the most PhD-relevant):** a **fiscal-policy news/uncertainty index from Stortinget and budget documents** (referat, Prop. 1 S/LS, questions), then event studies of **budget days, tax-proposal announcements and voting outcomes on Oslo Børs sectors and NOK**. Examples: the 2022 wealth/dividend tax changes and the response of closely held firms; the electricity-support debates and utility stocks. The data (Stortinget text, Lovtidend dates, Oslo Børs/Euronext prices, Norges Bank FX) comes straight out of the lake. Keep it modest: event studies with proper inference, no grand causal claims.
4. **Nowcasting Norwegian macro with the SSB lake:** a solid ML application with clear baselines (Norges Bank's own models in the literature).
5. **Pledge fulfilment in Norway 2013–2029:** contribute Norway to the comparative pledge literature, ideally with a political scientist co-author.

---

## 8. Prompt stubs (expand when each phase starts)
Prompts 01–03 already exist (Phase 1). Each later prompt should follow the same pattern: read PLAN.md, VISION.md and CLAUDE.md → plan → wait for go → small PRs → stop and summarise.

- **prompt-04**: Astro site skeleton in `site/` + `riksdata export` (per-series JSON, `catalog.json`) + a GitHub Pages deploy to `/beta/` via Actions.
- **prompt-05**: Explorer series page: line/table, compare picker, transforms (per capita, % GDP, % mainland GDP, real, index), metadata panel, CSV download, permalink state.
- **prompt-06**: "Norge 2026" front page from `registry/frontpage.yaml` (24 tiles, sparklines, "siste nytt fra kildene").
- **prompt-07**: Chartbook MDX `<Chart>` component + 3 pages (Norge i 30 grafer, Norge vs. Norden, Skatt i Norge teaser) + the government-period band ported from v1.
- **prompt-08**: DFØ statsregnskap + bevilgningshistorikk adapters → `budget_lines` (encoding cp1252, `;`, decimal comma) with tests.
- **prompt-09**: Flagship F1 "Hvor går 1000 kroner" (COFOG treemap + time slider + state-budget lens) + methodology page.
- **prompt-10**: Flagship F2 "Skattetrykk" measure matrix (OECD Revenue Stats + Taxing Wages + WB + SSB mainland GDP) + explainer cards.
- **prompt-11**: F5 "Hvor er Norge annerledes?" outlier wall (z-scores vs. OECD, coverage rules).
- **prompt-12**: v1 → `/v1/` cut-over: move v1 to `legacy/`, deploy v2 at root, redirects, and the manual Pages-settings checklist for Egil.
- **prompt-13**: Stortinget full model: questions, hearings, meetings, committees, `voteringsforslag`/`voteringsvedtak`, enum mapping tables, a backfill to 2011–12 with resume.
- **prompt-14**: The entities table + Klass crosswalks (municipalities/counties, time-valid) + Wikidata enrichment for persons, parties and governments.
- **prompt-15**: valgresultat.no adapter (2009→, all levels to krets) + Kartverket geometry + election maps.
- **prompt-16**: F4 voting similarity (party positions, agreement with CIs, cohesion, topic slices, heatmap + MDS) + MP pages.
- **prompt-17**: Tax engine core: parameter YAML (OpenFisca-style, with Lovtidend references), wage-earner income tax 2024–2027, golden-test harness.
- **prompt-18**: Employer side + tax wedge, validated against OECD Taxing Wages Norway.
- **prompt-19**: TS port of the engine + shared golden tests in CI + calculator page with marginal/average rate curves.
- **prompt-20**: documents/pages store: PDF ingestion (pdftotext, OCR fallback), page-anchored text, Lovdata public-data bulk import.
- **prompt-21**: Pledge extraction pipeline v1 (segmentation + qwen3:8b JSON-schema pass + quote verification) on 2 programmes.
- **prompt-22**: Review UI (local Streamlit/Datasette over DuckDB) + gold-set annotation workflow + evaluation script (P/R/F1, κ, per-party recall).
- **prompt-23**: F3 party fiscal arithmetic: Innst. 2 S parsing of alternative budgets for budget 2027 + Finansdepartementet costings registry + page.
- **prompt-24**: Tax proposals → `Reform` overlays → household-grid winners/losers + published-cost display.
- **prompt-25**: F6 tracker MVP: evidence linking (embedding candidates + manual confirm), status model, promise cards, methodology.
- **prompt-26**: Manifesto diff 2021 → 2025 (pledge alignment + change classes) using the Sikt archive + MARPOR mapping.
- **prompt-27**: Partifinansiering adapter (2008→ Excel) + party finance page.
- **prompt-28**: Events/reform timeline from Lovdata + budgets + Stortinget decisions, with chart annotations.
- **prompt-29**: Wealth tax + capital income in the engine; then prompt-30 benefits and EMTR curves.
- **prompt-31**: Lab: staggered-DiD/event-study template on a KOSTRA municipal reform, with a design note and robustness checks.

**New stubs from the 2026-10-03 source hunts** (see SOURCES.md and §1.7; registry fields `runner`, `secret_env`, `pii`, `encoding` per PLAN.md §10):
- **prompt-32**: Quick-win adapter pack: NAV statistics files (scrape attachment links from the official statistics pages, Latin-1, `;`, decimal comma), NAV G API, Norges Bank HMS xlsx, NVE kraftverk, Mattilsynet smilefjes CSV, ranking files (TI CPI xlsx, RSF CSV, HDI CSV, WGI via WB `source=3`), SSB table packs (10318, 08815, 13151, 05926 …) as registry entries only.
- **prompt-33**: Quick-win pages QW1–QW8 (§1.7), one PR per page, each with a methodology box and licence line.
- **prompt-34**: SSB chunked fetch for huge tables (12367: 66.5M cells, so year × ~25 municipalities per call, 40 calls/60 s, resumable, ~1 h backfill) + the "Din kommune: kommunekassa" page (07022, 14670, 13540-series).
- **prompt-35**: IMF SDMX 3.0 adapter (positional keys, URL-encoded filter brackets, vintage flows, per-indicator paging for PSBS) + "Statens balanse" + the forecast scorecard (with OECD EO vintages).
- **prompt-36**: OECD flow pack with a cached DSD key builder: TaxBEN (METR/PTR/NRR), DF_REVNOR, IDD/WDD, PMR, EO + vintages, SOCX net, LMP, PIT/CIT tables. Then the EMTR explorer v0 on OECD data.
- **prompt-37**: Privacy-aware ingest (`pii: hash_ids|aggregate`): salted hashing at ingest, validator that fails if PII reaches `clean/`; Fiskeridir frtyweb + fangstdata + Akvakulturregisteret + Havbruksfondet → "Hvem eier havet?"; Landbruksdir per-farm → "Gårdsstøtten" (distributions only).
- **prompt-38**: Energy pack: Elhub energy-data (JSON:API), hvakosterstrommen + ENTSO-E (key), NVE nettleie + magasin → "Strømregningen din".
- **prompt-39**: Services pack: Udir NSR/NBR/Elevundersøkelsen, FHI multi-source adapter (13 registries + nokkel), Helsedir HAPI (key) → "Din skole", "Helsekøen".
- **prompt-40**: Accessibility: SSB 250 m grid + Geonorge addresses + Entur GTFS + facility lists → "Avstand til staten" (isochrones precomputed offline).
- **prompt-41**: Government activity: eInnsyn `/statistics`, Støtteregisteret POST adapter (verify the endpoint first; the old paths are dead), Innovasjon Norge (cp1252), Forskningsrådet, TED (+ Doffin with key) → "Statens postkasse", "Hvem får støtte?".
- **prompt-42**: Text and attention: ParlaMint-NO/5.0 TEI ingest + extension past 2022 from referat XML, DHLAB n-grams, Wikimedia pageviews → attention dashboard; later "Ord vs. stemmer".
- **prompt-43**: Local democracy: Sikt Kommunedatabasen API + valg.no list/candidate XLSX + Partiregisteret → "Lokaldemokratiet" (aggregate candidates, name only the elected).
- **prompt-44**: Accountability pack: ECHR statistics files, Riksrevisjonen grade classifier (LLM suggestion + human review), Sivilombudet, Trygderetten tables → "Norge for retten".
- **prompt-45**: Petroleum and fund: Sodir FactPages CSV + FactMaps ArcGIS, NBIM holdings (UTF-16), NBIM voting (key), Etikkrådet WP JSON → "Oljefondet og deg".
- **prompt-46**: Coast: Kystdatahuset (MARU, port calls, cruise) + BarentsWatch lice (key) → "Kysten i tall".
- **prompt-47**: Rolling-feed archiver Action (Politiloggen, Avinor XML, AIS/Entur live): daily compressed snapshots to a private bucket or release asset, retention policy, aggregates-only publishing.
- **prompt-48**: Mac runner: `riksdata update --runner mac` for `runner: mac` sources (regjeringen.no documents, EEA-Lex, Karantenenemnda, eierberetning, Grønt hefte), a reachability probe that runs from both the box and Actions, and an upload of the outputs to the data release (Egil runs it manually).
- **prompt-49**: Keys and secrets: `secret_env` in the registry, `.env.example`, a checklist of GitHub secrets for Egil (SOURCES A2), and a graceful skip with a warning when a key is missing.
- **prompt-50**: Long-run and inequality pack: OWID slug list, WID `WID_data_NO.csv` via HTTP range, vendored PWT 11 file (DOI + sha256), JST (`publish: false`), IMF HPD → completes "Norge i 200 år".
