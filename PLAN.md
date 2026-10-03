# Riksdata 2.0 — PLAN

> Living document. Update it in the same PR whenever an architectural decision changes.
> Last revised: 2026-10-03 (see the changelog at the bottom).
> Companion docs: `VISION.md` (12-month product vision and roadmap), `SOURCES.md` (source catalogue).

## 1. Vision
**Riksdata: Norge som datasett.** A source-linked, version-controlled quantitative model of Norway that brings together official statistics, the rules of the tax and benefit system, party programmes and parliamentary behaviour, with disciplined international comparisons and long history.

Design principle: **turn political arguments into inspectable quantities.** Not "Norway has high taxes", but which tax, on which base, raising how much, compared with whom, measured how, and what each party proposes to change.

The four layers, built bottom-up:
1. **Norge nå (data)**: what is. Observed statistics, Norway vs. the world, over time.
2. **Maskineriet (law)**: how it works. Executable rules, starting with the tax engine.
3. **Politikken (proposals)**: what parties want to change, as structured parameter changes.
4. **Virkeligheten (action)**: what Stortinget actually votes for and enacts.

Politics is an *overlay* on a coherent data model of Norway. The database isn't organised around parties.

### Non-goals
- Riksdata doesn't judge which party is right. It shows mechanics, magnitudes, sources and assumptions.
- No hand-made one-off charts. Every chart is a spec rendered from the shared data model.

## 2. Epistemic tags
Every number shown on the site belongs to exactly one of **four** categories, and the UI displays the tag:
| Tag | Meaning | Example |
|---|---|---|
| `DATA` | Observed statistic from a publisher | SSB: general government expenditure 2025 |
| `LAW` | Current statutory rule or parameter | Ordinary income tax rate 22% (2026) |
| `ESTIMATE` | A quantitative estimate. `estimate_by = publisher` (Finansdepartementet costing, SSB projection, IMF forecast) or `estimate_by = riksdata` (our own model: tax engine, agreement rates, z-scores) | Finansdepartementet's cost of proposal X; Riksdata household calculation |
| `PROPOSAL` | A party's or government's proposed rule/parameter/spending | Venstre: remove wealth tax on working capital |

Riksdata's own calculations are `ESTIMATE` with `estimate_by = riksdata` (there's no separate MODEL tag).

## 3. Architecture

```
registry/*.yaml ──► adapters (Python) ──► lake/raw/<source>/<date>/…   (archived, gitignored)
                                     └──► lake/parquet/…               (normalized, gitignored)
                                                 │
                                    lake/riksdata.duckdb (views only)
                                                 │
                        riksdata validate ──► lake/run_report.json
                                                 │
                        riksdata export ──► site/public/data/*.json (+ parquet for Datalab)
                                                 │      (today: beta/data/*.json, for the stopgap page)
                                                 │
                                   site/ (Astro + Observable Plot) ──► GitHub Pages (riksdata.org)
```

### Repository layout
```
riksdata/
├── README.md, PLAN.md, VISION.md, SOURCES.md, CLAUDE.md
├── pyproject.toml, uv.lock          # Python 3.12, managed with uv
├── py/riksdata/                     # Python package (module-root = "py"; v1 owns src/)
│   ├── cli.py                       # typer app: update | validate | catalog | sql | check-sources | export
│   ├── registry.py                  # pydantic models + loader for registry/*.yaml
│   ├── http.py                      # httpx client, per-source rate limiter, retries, User-Agent; Sampler for bounded checks
│   ├── storage.py                   # all file I/O: raw archive, parquet, duckdb views, reports, exports
│   ├── validate.py                  # data-quality checks
│   ├── periods.py                   # period parsing: 2026, 2026M08, 2026K2/Q2, 2026U14 → canonical period, start and end
│   ├── sourcecheck.py               # `check-sources`: one small request per SOURCES.md row
│   ├── export.py                    # the published series as JSON for the site
│   └── adapters/{base,ssb,owid}.py  # next: worldbank, oecd, stortinget, then norgesbank, dfo …
├── registry/
│   ├── sources.yaml                 # one entry per source with an adapter
│   ├── datasets/<source>.yaml       # what to fetch from each source
│   └── source_checks.yaml           # one small request per SOURCES.md row, with its access class
├── tests/  (+ tests/fixtures/<source>/… small recorded responses)
├── docs/v2/                         # quickstart, one page per adapter (sources/), source checks and inventory, the beta page
├── beta/                            # stopgap page at riksdata.org/beta/ and its exported data, until Phase 2
├── lake/                            # GITIGNORED: raw/, parquet/, riksdata.duckdb, run_report.json, source_checks/
├── .handoff/                        # GITIGNORED: session prompts and reviews from the planning chat
├── site/                            # v2 front end (Phase 2, not started)
├── .github/workflows/               # ci.yml, update.yml (Phase 1c, not started), deploy.yml in Phase 2
└── index.html, src/, data/, assets/, sw.js, docs/*.md … # v1, frozen. Do not modify. Moves to legacy/ at Phase 2 cut-over.
```

### Key decisions (and why)
- **Python ingestion, static site.** No servers, no database server. DuckDB over Parquet scales to tens of millions of observations on a laptop and in GitHub Actions.
- **Raw is archived, normalized is rebuilt.** Never overwrite raw. Statistics get revised, and dated raw files give us vintages ("what was known in Sept 2026?").
- **Data is not committed to git.** `lake/` is gitignored. Snapshots are published as GitHub Release assets (`data-YYYY-MM-DD`), and the site's JSON is a CI build artefact. v1's committed `data/` stays only until cut-over.
- **The site sees one format.** Per-series JSON (`{meta, period[], value[]}`) is exported from DuckDB. The browser never parses JSON-stat or SDMX. DuckDB-WASM appears only on an advanced Datalab page (Phase 2b).
- **Front end is rewritten, not extended.** v1 parses raw source formats in the browser across about 12k lines of hand-wired vanilla JS. v2 uses Astro + MDX for chartbook pages and Observable Plot for charts, with interactive islands only where needed. Kept from v1: political timeline and party colours, design tokens, curated series list, domain.
- **Explicit registry.** A dataset exists in Riksdata only if it's in `registry/datasets/*.yaml`. Docs and the site catalogue are generated from the registry. Source catalogues (e.g. all ~3,750 SSB tables) are pulled separately for discovery.

## 4. Data model
All tables live as Parquet under `lake/parquet/<table>/` and are exposed as DuckDB views of the same name. `series` and `observations` are one file per dataset (`source=<id>/<dataset>.parquet`). Single-file tables sit directly in `lake/parquet/` (`sources.parquet`, later `entities.parquet`).

**sources**: `source_id` (pk, e.g. `ssb`), `name`, `publisher`, `homepage`, `api_base`, `licence` (SPDX-ish: `CC-BY-4.0`, `NLOD-2.0`), `licence_url`, `attribution`, `rate_limit_calls`, `rate_limit_seconds`, `tier` (1 primary NO, 2 international harmonised, 3 aggregator, 4 encyclopaedic), `access`, `redistribution`, `terms_checked`, `timeout_seconds`.

**series**: one row per distinct time series.
`series_id` (pk, stable slug `{source}.{dataset}.{key}`, e.g. `ssb.14710.kpiindmnd`, `owid.life-expectancy`, `oecd.rsoecd.total_tax_pct_gdp`; for SSB the key is the `series_key` codes in lower case joined by `_`), `source_id`, `dataset_id`, `dims` (JSON of the non-time dimension codes that define the series), `title_no`, `title_en`, `unit`, `unit_mult` (power of 10), `frequency` (`A|Q|M|W|D`), `concept` (e.g. `tax_revenue`), `coverage` (e.g. `general_government` vs `central_government`), `topic`, `tag` (see §2), `estimate_by` (null unless tag = ESTIMATE: `publisher|riksdata`), `publish` (bool; false for sources whose terms forbid republication), `source_url`, `citation`, `licence`, `first_period`, `last_period`, `source_updated` (timestamp from the publisher), `retrieved_at`.

**observations**: `series_id`, `entity_id`, `period` (canonical string: `2026`, `2026-Q2`, `2026-08`, `2026-W14`, `2026-08-31`), `period_start` (DATE), `value` (DOUBLE), `status` (publisher flag, nullable), `vintage` (DATE of retrieval). Unique on `(series_id, entity_id, period, vintage)`. View `observations_latest` keeps the newest vintage.

**entities**: `entity_id` (pk), `entity_type`, `name_no`, `name_en`, **`valid_from`, `valid_to`, `parent_id`**, `iso3`, `ssb_code`, `klass_version`, `stortinget_id`, `wikidata_id`, `orgnr`. ID scheme (full table in VISION §3.2):
- countries: ISO3 (`NOR`, `SWE`); aggregates `OECD`, `EU27`, `WORLD`
- counties `NO-F-03`; municipalities `NO-K-0301`. These are **time-valid** (the 2020 and 2024 reforms changed codes), with crosswalks from SSB Klass
- **electoral districts** `NO-V-<id>`. These are the *old 19 counties* (Stortinget `fylker`, valgresultat.no) and are not the same as current counties
- parties `party:A`; persons `person:HASABD`; committees `committee:KONTROLL`; governments `gov:store-ii`; organisations `org:<orgnr>`

Countries also carry an `alt_codes` JSON with every publisher code: `NOR` (IMF/OECD/WB), `NO` (BIS/Eurostat/ECB), `578` (ISO numeric, Atlas), `579` (UN Comtrade). Adapters map to `entity_id` through it, never through ad-hoc lookups. Phase 1 only needs countries, `NOR` and the Stortinget entities. The table is designed time-valid from the start so we never have to migrate IDs.

**Stortinget (relational, not time series)**: `st_sessions`, reference tables `st_parties`, `st_districts`, `st_topics` (emner, which also seeds our policy taxonomy), `st_committees`, plus `st_cases` (sak), `st_votes` (votering: id, sak_id, time, topic, personal flag, for/against counts), `st_vote_results` (votering_id, person_id, party_id, county_id, vote ∈ {for, mot, ikke_tilstede}), `st_representatives`. Derived series (e.g. party agreement rates) are written back into `series`/`observations` with tag `ESTIMATE`, `estimate_by = riksdata`.

**Later tables (designed in VISION §3, not built in Phase 1):** `documents` + `pages` (page-anchored text for programmes, budgets, referat; raw files under `lake/docs/`), `proposals`, `proposal_evidence`, `budget_lines`, `alt_budget_lines`, `events`, `entity_links`.

## 5. Registry format
`registry/sources.yaml`
```yaml
ssb:
  name: Statistisk sentralbyrå
  publisher: Statistics Norway
  homepage: https://www.ssb.no
  api_base: https://data.ssb.no/api/pxwebapi/v2
  licence: CC-BY-4.0
  licence_url: https://www.ssb.no/en/diverse/lisens
  attribution: "Kilde: Statistisk sentralbyrå"
  rate_limit: {calls: 35, per_seconds: 60}   # API enforces 40/60s per IP
  tier: 1
  access: api                 # api | bulk | scrape (scrape only with written permission / clear terms)
  redistribution: attribution # open | attribution | restricted (restricted ⇒ datasets default to publish: false)
  terms_checked: 2026-10-03
  timeout_seconds: 60         # Stortinget needs 120 (written questions take >30 s)
  runner: box                 # box | actions | mac — where the fetch can run (SOURCES.md A1: regjeringen.no, EEA-Lex, NVDB … are blocked from datacentre IPs)
  secret_env: null            # e.g. ENTSOE_TOKEN; read from env/GitHub secrets, never committed. Missing key ⇒ skip with a warning
  encoding: utf-8             # file defaults; override per dataset. Seen: cp1252 (DFØ, Innovasjon Norge), latin-1 (NAV), utf-16 (NBIM)
  delimiter: ","              # ";" is common for Norwegian CSVs
  decimal: "."                # "," for DFØ, NAV, RSF
```
`registry/datasets/ssb.yaml`
```yaml
- dataset: "14710"
  slug: kpi
  title_no: Konsumprisindeks (2025=100)
  title_en: Consumer price index (2025=100)
  topic: prices
  frequency: M
  select:                      # passed as valueCodes[...]; every dimension must be listed
    ContentsCode: [KpiIndMnd]  # explicit codes from the table's /metadata; quote digits ("0")
    Tid: ["*"]                 # "*" only for time, so new periods arrive on their own
  series_key: [ContentsCode]   # every non-time dim, in table order: keeps series ids stable
  entity: NOR
  schedule: daily              # daily | weekly | monthly
  superseded_by: null          # set when the publisher closes the table
  publish: true                # false ⇒ kept in the lake for analysis, never exported to the site (default false for NC/SA-licensed sources until Egil decides; SOURCES.md A3)
  terms_note: null             # a Norwegian sentence shown beside the licence. Required to publish a series whose upstream licence is not an open one (`validate`: licence_terms)
  pii: none                    # none | aggregate | hash_ids — person-level registers (Fiskeridir owners, farm subsidies, eInnsyn names) are hashed or aggregated at ingest
  chunk_by: null               # e.g. {Tid: 1, Region: 25} for tables above the 800k-cell limit (SSB 12367 = 66.5M cells)
```
`registry/datasets/owid.yaml`
```yaml
- dataset: life-expectancy
  title_no: Forventet levealder ved fødsel
  topic: health
  entities: [NOR, SWE, DNK, FIN, ISL, DEU, GBR, USA, OWID_WRL]
  schedule: weekly
```

## 6. Adapter interface
```python
class Adapter(Protocol):
    source_id: str
    def catalog(self, *, include_discontinued: bool = False) -> pl.DataFrame | None: ...  # optional full catalogue
    def remote_updated(self, ds: DatasetSpec) -> datetime | None: ... # cheap staleness probe
    def fetch(self, ds: DatasetSpec) -> RawArtifact: ...            # url, fetched_at, content_type, content, meta
    def normalize(self, raw: RawArtifact, ds: DatasetSpec) -> Batch: ...  # Batch(series, observations) polars DataFrames
```
Rules: adapters do no I/O except through `http.py`. They never write files themselves (`storage.py` does). `normalize` is a pure function of `(raw, ds)` and is unit-tested against fixtures. `RawArtifact.content` is the main response as bytes. `RawArtifact.meta` carries any second document `normalize` needs (SSB's English metadata, OWID's chart and indicator metadata) and is archived beside the raw file as `<dataset>.meta.json`. **PII rule:** when `pii` ≠ `none`, raw person identifiers (11-digit IDs, names of private persons) are replaced with a salted HMAC (salt from the `RIKSDATA_PII_SALT` secret) or dropped inside `normalize`, so they never reach `clean/`. `riksdata validate` fails if a column flagged as PII survives, or if a `publish: true` series comes from a `pii: aggregate` dataset without an aggregation step.

## 7. Source notes (verified live 2026-10-03)
| Source | Base | Auth | Limit | Licence | Notes |
|---|---|---|---|---|---|
| SSB PxWeb v2 | `https://data.ssb.no/api/pxwebapi/v2` | none | 40 calls/60s per IP; 800k cells/request | CC BY 4.0 | `/tables?lang=en&pageSize=10000` gets the whole catalogue (3,753 active, 7,795 incl. discontinued). `/tables/{id}/metadata`, `/tables/{id}/data?valueCodes[Dim]=…&outputFormat=json-stat2`. Always pass explicit valueCodes. Old `api/v0/dataset` is **410 Gone**. CPI rebased to 2025=100 (tables 14700–14711) and table 03013 closed. A closed table has `discontinued: true` in `/tables/{id}`. Details: `docs/v2/sources/ssb.md`. |
| Stortinget | `https://data.stortinget.no/eksport/` | none | 100 calls/min (429 after) | NLOD 2.0, credit Stortinget | `?format=json`. .NET dates `/Date(ms+0200)/`, integer enums, `antall_for=-1` when not recorded. Per-MP results only when `personlig_votering: true`. Current session 2026-2027. Big endpoints are slow (`skriftligesporsmal` >2.8 MB / >30 s), so use a 120 s timeout. Referat (debate transcripts) are available as XML via `publikasjon?publikasjonid=`. |
| OWID | `https://ourworldindata.org/grapher/{slug}.csv?v=1&csvType=full&useColumnShortNames=true` + `{slug}.metadata.json?v=1&…` | none | be polite | CC BY 4.0 for OWID work; third-party data keeps original licence | Store `citationShort` per series, and the upstream licences from `https://api.ourworldindata.org/v1/indicators/{id}.metadata.json`. CSV headers are lower case; projection columns end in `__projected`. Details: `docs/v2/sources/owid.md`. |
| World Bank | `https://api.worldbank.org/v2/country/{iso3;iso3}/indicator/{code}?format=json&per_page=20000` | none | none documented | CC BY 4.0 | Response is `[meta, rows]`. Tax indicators are **central government** only. |
| OECD | `https://sdmx.oecd.org/public/rest/data/{agency},{dsd}@{df},{ver}/{key}?startPeriod=…&format=csv` | none | **60 data calls/hour**, no VPN. Count structure calls too: on 2026-10-03 the API answered 429 on the 22nd request in 42 seconds (the 49th in about 40 minutes), structure and data together, and then refused structure requests as well | CC BY 4.0 | Key needs one slot per dimension: wrong count → 403, wrong codes → 404 `NoResultsFound`. Verified: `OECD.CTP.TPS,DSD_REV_COMP_OECD@DF_RSOECD,/NOR+SWE+DNK+FIN+OECD_REP.TAX_REV.S13._T._T.PT_B1GQ.A` → NOR 2024 = 40.19. Cache each DSD (`dataflow/{agency}/{id}/{ver}?references=datastructure`) and build keys from it. Cache the 8.9 MB dataflow catalogue too. |
| Norges Bank | `https://data.norges-bank.no/api/data/` | none | — | NLOD | SDMX-JSON. |
| DFØ statsregnskap | `https://statsregnskapet.dfo.no/nedlasting/statsregnskapet_aar_YYYY.zip` (+ `_siste_maaned`, `_hittil_i_aar`, bevilgningshistorikk) | none | — | NLOD | CSV `;`, **Windows-1252**, decimal comma, `Periode=YYYYMM`, columns kapittel/post/artskonto/virksomhet. |
| Valgdirektoratet | `https://valgresultat.no/api/{year}/{st\|ko\|fy\|sa}/{district}/{kommune}/{krets}` | none | cache 15 s | (verify, likely NLOD) | HAL+JSON. Elections 2009→. Navigate via `_links.related`. |
| Lovdata | `https://api.lovdata.no/v1/publicData/list` → `/get/<file>` | none | — | NLOD 2.0 | Bulk tarballs (laws, regulations, Lovtidend 2001→). Never scrape lovdata.no. |
| IMF SDMX 3.0 | `https://api.imf.org/external/sdmx/3.0/data/dataflow/{agency}/{flow}/+/{key}` | none | slow (~40 s per country × flow) | IMF terms (verify) | **The main IMF adapter** (DataMapper is a fallback). 223 flows incl. dated vintages (`WEO_2025_OCT_VINTAGE`). Positional keys (`NOR.NGDP_RPCH.A`). URL-encode filter brackets (`c%5BCOUNTRY%5D=NOR`). Page PSBS by indicator. |
| NAV | `https://g.nav.no/api/v1/grunnbeløp`; files `https://www.nav.no/_/attachment/download/<uuid>:<hash>/<file>.csv` | none | — | CC BY 4.0 | `data.nav.no` is dead (404). File hashes change monthly, so read the links from the statistics page. `;`, Latin-1, decimal comma. Our own User-Agent gets both the pages and the files (checked 2026-10-03). |

## 8. Phases

### Phase 1: data pipeline (`riksdata update`)
Done when `uv run riksdata update && uv run riksdata validate` builds a validated lake from **SSB, OWID, Stortinget, World Bank and OECD**, CI runs tests on every PR, and a scheduled workflow refreshes nightly and publishes snapshots.
- **1a** Scaffold, registry, http client, storage, CLI, **SSB** (catalogue + 7 tables) and **OWID** (~10 charts). (Claude Code session 1) **Done**, and since extended: 13 SSB tables and 15 OWID charts (113 series), `check-sources` over the 318 catalogued sources with the source inventory, `export` and the stopgap page at `/beta/`.
- **1b** **Stortinget** (sessions, cases, votes, per-MP results; incremental) + **World Bank** + **OECD**. (session 2)
- **1c** GitHub Actions: `ci.yml` + `update.yml` (cron, artefacts, weekly release snapshot, run report, freshness file). (session 3)
- **1d** (reordered by VISION): **DFØ statsregnskap + bevilgningshistorikk** (needed for the "Hvor går 1000 kroner" flagship), **valgresultat.no** (elections), the **Lovdata public-data list** (index only), Norges Bank, and the data.norge.no catalogue. Next, the quick-win adapters (VISION §1.7, prompt-32): NAV files + G API, Norges Bank HMS xlsx, NVE kraftverk, Mattilsynet, ranking files. The registry fields `runner`, `secret_env`, `pii`, `encoding`/`delimiter`/`decimal` and `chunk_by` should exist from 1a (cheap to add now, painful later), even if unused at first.
- **1b scope addition:** Stortinget reference tables (`partier`, `fylker`, `emner`, `komiteer`, `stortingsperioder`) are cheap and become the entity/taxonomy backbone, so include them in 1b.

Starter SSB tables: 14710 CPI (2025=100), 13760 LFS monthly (seasonally adjusted), 05803 population 1735–2026, 14669 general government expenditure by function, 07391 taxes paid by type (monthly), 12439 sickness absence, 09842 GDP per capita.

> Phases 2–4 below are the short version. The authoritative 12-month sequence is **VISION.md §7 (milestones M1–M8)**. Notably, the **Stortinget layer (M4) comes before the tax engine (M5)**, and the v2 site launches first at `/beta/` while v1 stays at `/`.

### Phase 2: explorer + chartbook
Astro site in `site/`: "Norge nå" sparkline home page; Explorer (search → series page with compare, index/per-capita toggles, source, licence, CSV); MDX chartbook pages ("Skatt i Norge vs Norden", "Hvor går statens penger?", "Norge i 20 grafer", "Stortinget 2025–2026"); v1's government-period band as a chart layer. Launch first at `riksdata.org/beta/` (v1 untouched at `/`). Cut-over after the first flagships (VISION M3): v1 → `legacy/` (served at `/v1/`), Pages source → GitHub Actions (**manual settings change by Egil**). 2b: DuckDB-WASM Datalab.

### Phase 3: tax engine
`registry/tax/<year>.yaml` parameters with citations; Python reference engine `riksdata.tax` + TypeScript port for the browser; shared golden cases in `tests/tax/golden/` run by both. Start with wage earners/pensioners (22% ordinary income, trinnskatt, trygdeavgift, minstefradrag, personfradrag), then wealth tax, arbeidsgiveravgift, marginal-rate curves, benefit interactions.

### Phase 4: proposals + votes
`proposals` table extracted (LLM-assisted) from 2025–2029 programmes with page citations and mandatory human verification; tax proposals evaluated through the Phase 3 engine; representative pages and party agreement matrices by topic over time; links proposal → sak → votering.

## 9. Conventions
See `CLAUDE.md`. In short: branch per task, small PRs, pytest, uv, no data blobs in git, registry and docs updated with every adapter, `riksdata update` + `validate` before every PR.

## 10. Changelog of decisions
- **2026-10-03 (v2, after VISION.md):**
  1. Epistemic tags reduced to **four** (`DATA|LAW|ESTIMATE|PROPOSAL`). `MODEL` is now `ESTIMATE` with `estimate_by = riksdata`. Added the `estimate_by` column.
  2. Added `publish` to series/datasets, and `access`, `redistribution`, `terms_checked`, `timeout_seconds` to sources. Restricted sources (polls, MARPOR raw, survey microdata) can live in the lake but are never exported.
  3. `entities` is **time-valid** (`valid_from/valid_to/parent_id`), with an ID scheme incl. electoral districts (old 19 counties), committees and governments.
  4. Stortinget 1b now includes the reference tables (parties, districts, emner, committees, periods). Use a 120 s timeout for large endpoints.
  5. Phase 1d reordered: DFØ, valgresultat.no and the Lovdata index come first. Norges Bank and data.norge.no follow.
  6. The v2 site launches at `/beta/` before the cut-over. Stortinget (M4) comes before the tax engine (M5), per VISION §7.
  7. Future tables (`documents`, `pages`, `proposals`, `budget_lines`, `events`, `entity_links`) are named now so Phase 1 code doesn't collide with them.
- **2026-10-03 (Phase 1a as built, PR `v2/01-scaffold`):**
  1. The rate limiter is a **sliding window**, not a token bucket. A bucket of the same size lets through twice the limit right after an idle spell, which would break SSB's 40 calls per 60 s.
  2. SSB series ids come from codes (`ssb.14710.kpiindmnd`). The registry pins explicit codes for every non-time dimension and uses `"*"` only for `Tid`. `series_key` lists every non-time dimension so ids stay stable when a selection is widened.
  3. `RawArtifact` has `content` (bytes) and `meta`. `meta` is archived as a sidecar so `normalize` can be re-run from `lake/raw/`.
  4. OWID series carry the **upstream licences** OWID records per indicator, not a blanket `CC-BY-4.0`. OWID projection columns are separate series tagged `ESTIMATE`, `estimate_by = publisher`.
  5. `registry/sources.yaml` holds only sources with an adapter (per SOURCES.md): `ssb` and `owid` so far. Each later adapter PR adds its own source.
  6. `unit` is stored as published, including multipliers ("mill. kr"), with `unit_mult = 0`. Normalising units is future work.
  7. `update` skips a dataset only when both the publisher's timestamp and a fingerprint of its registry entry are unchanged. `schedule` is validated but not acted on until Phase 1c.
  8. The SSB catalogue is fetched in Norwegian and English so `catalog --search` matches both.
  9. Each `update` rewrites a dataset's Parquet with the latest fetch. Older vintages live only in `lake/raw/` until a rebuild-from-raw command exists.
- **2026-10-03 (v3, after the five source hunts; SOURCES.md v2 has 309 rows):**
  1. New source fields: `runner` (box/actions/mac, for sources blocked from datacentre IPs), `secret_env` (keyed sources; GitHub secrets only), `user_agent`, and file-format defaults `encoding`/`delimiter`/`decimal` (cp1252, Latin-1 and UTF-16 recur).
  2. New dataset fields: `pii` (none/aggregate/hash_ids) with a hash-or-drop-at-ingest rule enforced by `validate`, and `chunk_by` for tables above SSB's 800k-cell limit (12367 = 66.5M cells).
  3. Countries get `alt_codes` (NOR / NO / 578 / 579) so IMF, BIS, Eurostat, Comtrade and Atlas map to one entity.
  4. IMF SDMX 3.0 becomes the main IMF adapter (vintages, PSBS, GFS). DataMapper is a fallback. The OECD adapter caches DSDs and builds keys from them.
  5. NAV source note fixed (`data.nav.no` is dead; files + G API, CC BY 4.0).
  6. Phase 1d continues with the quick-win adapters. No change to the Phase 1 starter tables or prompts 01–03.
- **2026-10-03 (source checks, PR `v2/01c-source-check`):**
  1. New command `riksdata check-sources` and `registry/source_checks.yaml`: one small, unretried request per SOURCES.md row, paced per host, reading at most 64 KB. It reports `ok`, `reachable`, `needs_key`, `blocked`, `unreachable`, `failed` or `skipped`. Entries with `pii: true` keep no sample. Results and the Mac-versus-server differences are in `docs/v2/source-checks.md`.
  2. `riksdata.http` gains `Sampler` for these bounded requests. Adapters keep using `HttpClient`.
- **2026-10-03 (beta page, PR `v2/01d-beta`):**
  1. `riksdata export` exists. It writes the published series, the source-check results and a build summary to `beta/data/` as JSON. A series that is no longer published has its file removed.
  2. A stopgap beta page lives in `beta/` and is served at `riksdata.org/beta/` by the existing Pages setup. It is hand-written HTML, CSS and JavaScript with no build step. **`beta/data/` is committed**, which departs from "the site's JSON is a CI build artefact". That holds until the Astro site and its Actions deploy exist (Phase 2); then `beta/` is replaced and the data leaves git again.
  3. Per-series JSON is `{meta, entities: {<entity_id>: {period[], value[]}}}`, because one series can cover several countries.
  4. Six more SSB tables and five more OWID charts were added through the existing adapters (see the source docs). The lake now has 115 series; 110 are published.
- **2026-10-03 (source inventory, PR `v2/01e-source-inventory`):**
  1. Every entry in `registry/source_checks.yaml` has an `access` class: `api`, `file`, `page`, `docs`, `manual`, `unknown` or `none`. `check-sources` records the size and date the server states for a response, and stops asking a host that answers 429. What the results mean for ingestion is in `docs/v2/source-inventory.md`.
  2. `SOURCES.md` gets section 23: seven candidate sources found during the testing. The check list has 316 entries.
  3. The OECD rate limit covers structure requests as well as data requests (§7). The OECD adapter has to budget every call.
  4. regjeringen.no is read through its sitemap and direct page and file addresses. Its `robots.txt` disallows `/api/` and filtered lists, so the search API behind its list pages is not used. The same goes for Udir's Statistikkportalen, whose `robots.txt` disallows everything.
- **2026-10-03 (review fixes, PR `v2/01e-review-fixes`):**
  1. Egil publishes the five held-back OWID charts (SIPRI, UNODC, UNICEF, FAO calorie supply, Energy Institute oil) for non-commercial use with attribution. Every published series with a non-open upstream licence part carries a `terms_note` that the site shows; `validate` fails without it (`licence_terms`). New non-open data still starts as `publish: false`.
  2. The User-Agent is always `riksdata/<version> (+https://riksdata.org; <contact email>)`, with the address from `RIKSDATA_CONTACT_EMAIL`. No browser-like User-Agent, ever; the `user_agent` registry field is removed. Refused hosts get their official API or bulk route instead (HUDOC → ECHR statistics files, ParlGov → Harvard Dataverse, www.oecd.org pages → OECD SDMX dataflows).
  3. Freshness is measured from the end of the last period. A `0` between non-zero values is flagged (`suspicious_zeros`). SSB 05803 no longer selects marriages and divorces (published as 0 for missing years).
  4. Some hosts refuse our HTTP client whatever it says about itself: www.echr.coe.int answers 403 to httpx and 200 to curl with the same User-Agent. Such rows stay `blocked`; changing the client to get past a bot check is a decision for Egil.
- **2026-10-03 (sweep, PR `v2/01f-sweep`):**
  1. No change to the data model or the architecture. The lint rules are wider (ruff: naming, simpler code, pathlib, timezone-aware datetimes, no `print`, pytest style, pylint's checks) and the package passes mypy, which is run on demand and is not a dependency.
  2. `SOURCES.md` carries the corrections from the Mac tests in its rows, and every row that was blocked from the server also gives the Mac's result. `docs/v2/source-checks.md` now only describes the command; all results are in `docs/v2/source-inventory.md`.
  3. `README.md` describes both the live v1 site and Riksdata 2.0. `.gitignore` drops v1's catch-all patterns. No v1 file is touched.
