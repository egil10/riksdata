# Source checks

`riksdata check-sources` sends one small request to every source in `SOURCES.md` and records what came back. It answers one question: can this source be reached from the machine the command runs on? It does not ingest anything. What the answers add up to is in the [source inventory](source-inventory.md).

```bash
uv run riksdata check-sources                    # all 318 rows, about five minutes
uv run riksdata check-sources --section 19a      # one SOURCES.md section
uv run riksdata check-sources --only parlgov     # one source (repeatable)
uv run riksdata check-sources --status failed    # re-check what failed last time
```

The list of requests is `registry/source_checks.yaml`, one entry per catalogue row. The report is written to `lake/source_checks/latest.json` (and a dated copy). A partial run updates the entries it touched and keeps the rest. The command prints two tables: sources per status, and sources per access class and status.

## How a check behaves

- **One attempt, no retries.** A host that refuses us is asked once.
- **Paced per host:** at most one request every two seconds to the same host. **A host that answers 429 gets no more requests in that run.**
- **The OECD API gets 25 requests in a full run**, three of them for data. Its limit covers every request, structure calls too, so don't repeat a full run more than about twice an hour.
- **At most 64 KB is read**, then the connection is closed. A check never downloads a large file. A few entries raise the limit to read a whole web page. The size and the `Last-Modified` date the server states for the whole response are recorded (`total_bytes`, `last_modified`), except for compressed transfers.
- **Our own User-Agent**, `riksdata/<version> (+https://riksdata.org; <contact email>)`, with the address from `RIKSDATA_CONTACT_EMAIL`. It is never a browser's. No keys are sent.
- **A soft 404 counts as failed.** Some hosts answer 200 after redirecting to their not-found page (a wrong ECHR address ends at `/web/echr/page-404`). A 2xx answer whose final address has `404` in its path, after a redirect, is `failed`.
- **Person-level sources keep no sample.** Entries with `pii: true` (farm subsidies, vessel owners, candidate lists, court cases and so on) are checked in memory and nothing of the response is stored. For every other source, the sampled start of the response is kept under `lake/source_checks/samples/`, which is gitignored.
- **Never-use rows are not requested at all.** Skattelister, Finn, Proff, pollofpolls and the other rows that `SOURCES.md` A3 rules out are listed with `skip` and a reason.

## Statuses

| Status | Meaning |
|---|---|
| `ok` | The endpoint answered and the expected content was in the response |
| `reachable` | A page or endpoint answered, but its content wasn't verified (mostly landing pages) |
| `needs_key` | The source wants a free key that we don't have yet |
| `blocked` | The host refused us: 401, 403 or 429 |
| `unreachable` | No answer: timeout, DNS, connection or certificate error |
| `failed` | An answer, but not the expected one: 404, 5xx or wrong content |
| `skipped` | Deliberately not requested |

## Access classes

Each entry says how the source hands out its data. The class is set by hand from what the source returned.

| Access | Meaning |
|---|---|
| `api` | A queryable API: REST, SDMX, PxWeb, GraphQL, ArcGIS and so on |
| `file` | A file at a stable address: CSV, Excel, ZIP and so on |
| `page` | Numbers on web pages: files whose addresses change, or HTML tables |
| `docs` | Text documents (PDF or HTML): reports, rulings, programmes |
| `manual` | Only through an interactive tool, a login or an order form |
| `unknown` | The source answers, but no data route was found |
| `none` | No source of its own: derived metrics and never-use rows |

## Results from Egil's Mac, 2026-10-03

| Status | Sources |
|---|---|
| ok | 201 |
| reachable | 63 |
| needs_key | 14 |
| blocked | 7 |
| unreachable | 2 |
| failed | 0 |
| skipped | 31 |

These are the results over the 318 entries of the check list, as of the evening of 2026-10-03. The first run that day, over the 309 catalogue rows, gave 159 ok and 94 reachable. Since then 40 checks were pointed at the data behind the page they used to request, seven candidates and two ECHR rows were added, and a handful of rows moved to official routes. The last full run was the second one (316 entries); rows changed after it were checked one by one. In that full run the ECB timed out and GDELT answered 429; both answered when asked again a few minutes later.

### What works from the Mac that was blocked from the server

`SOURCES.md` marks 22 rows as blocked from the server the catalogue was checked from. From the Mac:

- **regjeringen.no** answers on all ten rows (budget documents, Grønt hefte, TBU, høringer, the calendar, Karantenenemnda, Hurdalsplattformen and so on).
- **NVDB** and **Trafikkdata** (Statens vegvesen) return data.
- **EEA-Lex**, **Copernicus STAC**, **Penn World Table** (Dataverse metadata), the **Sikt party-document ZIP**, **Samordna opptak** and **Helseatlas** answer.
- **FRED** answers and asks for a key.

### Blocked or unreachable from the Mac

| Source | Result | Note |
|---|---|---|
| ECHR country profile and violations table | 403 | www.echr.coe.int answers 403 to our HTTP client (httpx) and 200 to curl with the same User-Agent. The refusal is about the client software, not about who we say we are |
| Arbeidstilsynet registers | 403 | Also blocked from the server |
| OpenTender | 403 | Also blocked from the server (Cloudflare) |
| ISSP (GESIS) | 403 | Landing page |
| Vannmiljø | 403 | |
| Kongehuset | 429 | Bot check, as from the server |
| Politiloggen | connection refused | As from the server |
| DSB brannstatistikk | timeout | |

**We never send a browser-like User-Agent** (Egil, 2026-10-03). A host that refuses ours gets its official API or bulk route instead, or we ask the publisher. Until then the row stays `blocked`. Three rows were moved to official routes that day:

- **HUDOC** has no public data API, and the address the first check used is its web UI's internal endpoint. The row is no longer requested. Two official ECHR statistics files took its place (and are blocked, see the table).
- **ParlGov** is checked through its 2024 release on Harvard Dataverse (CC0 1.0), not through parlgov.org, which answers 403.
- **Pages on www.oecd.org** are not fetched. The Trust Survey, the TaxBEN calculator's net replacement rates and health expenditure are checked as OECD dataflows. The OECD Economic Survey and the IMF Article IV report are publications with no data API, so those rows are link-outs and are not requested.

### Sources that need a free key

NBIM voting records, PolitPro, Doffin, Helsedirektoratet NKI, NVE HydAPI, ENTSO-E, NOBIL, NILU, MET Frost, BarentsWatch, Vegvesen Autosys, EPO OPS, Vinmonopolet and FRED. The sign-up addresses are in `SOURCES.md` A2. MARPOR and Patentstyret also need keys for their data; their open pages answer.

### Corrections to the catalogue

- **SSB table 06035** (price per square metre) is discontinued; its last period is 2024. Of the 203 SSB table ids named in section 1b, 200 are active. The other two (13546, 13550) only appear inside a range.
- **Eurostat `spr_exp_sum`** gives 404. `spr_exp_func` and `spr_exp_type` work.
- **The JST Macrohistory address** ending in `.xlsx` serves a Stata `.dta` file.
- **Støtteregisteret** pages start at 1. `page=0` gives 500.
- **www.helseatlas.no** has a certificate for another host name. `helseatlas.no` works.
- **energimerking.no** doesn't resolve. The service is at `enova.no/energimerking`.
- **DBH**: the API is at `https://dbh-data.dataporten-api.no/Tabeller/`. `/All` lists the tables, and a query needs `groupBy` and at least one filter.
- **Fastlegestatistikk** and **Samordna opptak søkertall**: the old addresses give 404. GP statistics are Power BI reports now, and DBH table 379 has the applicant numbers.
- **DFØ Innbyggerundersøkelsen** has a 2026 edition at `dfo.no/undersokelser/innbyggerundersokelsen-2026`.

The second round of testing found more. They are listed in the [source inventory](source-inventory.md).

## Adding or changing a check

Add an entry to `registry/source_checks.yaml`:

```yaml
- {id: my-source, section: "11", priority: B, access: api, name: "My source",
   url: "https://example.org/api/items?limit=1", expect: '"items"'}
```

Give `expect` (text in the body) or `expect_type` (text in the Content-Type header) whenever the endpoint returns data, so that the check can say `ok` rather than only `reachable`. `access` is required. Set `pii: true` if the response contains private persons. The other fields are described at the top of the file.
