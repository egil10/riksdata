# Source checks

`riksdata check-sources` sends one small request to every source in `SOURCES.md` and records what came back. It answers one question: can this source be reached from the machine the command runs on? It does not ingest anything.

```bash
uv run riksdata check-sources                    # all 309 rows, about four minutes
uv run riksdata check-sources --section 19a      # one SOURCES.md section
uv run riksdata check-sources --only hudoc       # one source (repeatable)
uv run riksdata check-sources --status failed    # re-check what failed last time
```

The list of requests is `registry/source_checks.yaml`, one entry per catalogue row. The report is written to `lake/source_checks/latest.json` (and a dated copy). A partial run updates the entries it touched and keeps the rest.

## How a check behaves

- **One attempt, no retries.** A host that refuses us is asked once.
- **Paced per host:** at most one request every two seconds to the same host. OECD gets three data calls (its limit is 60 per hour); the other OECD checks use the structure endpoint, which isn't limited.
- **At most 64 KB is read**, then the connection is closed. A check never downloads a large file.
- **Our own User-Agent** (`riksdata/<version> (+https://riksdata.org)`). No keys are sent.
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

## Results from Egil's Mac, 2026-10-03

| Status | Sources |
|---|---|
| ok | 159 |
| reachable | 94 |
| needs_key | 14 |
| blocked | 12 |
| unreachable | 2 |
| failed | 0 |
| skipped | 28 |

### What works from the Mac that was blocked from the server

`SOURCES.md` marks 22 rows as blocked from the server the catalogue was checked from. From the Mac:

- **regjeringen.no** answers on all ten rows (budget documents, Grønt hefte, TBU, høringer, the calendar, Karantenenemnda, Hurdalsplattformen and so on).
- **NVDB** and **Trafikkdata** (Statens vegvesen) return data.
- **EEA-Lex**, **Copernicus STAC**, **Penn World Table** (Dataverse metadata), the **Sikt party-document ZIP**, **Samordna opptak** and **Helseatlas** answer.
- **FRED** answers and asks for a key.

### Blocked or unreachable from the Mac

| Source | Result | Note |
|---|---|---|
| ECHR HUDOC | 403 | The catalogue's check from the server got data. The difference may be the User-Agent |
| ParlGov | 403 | Same |
| Arbeidstilsynet registers | 403 | Also blocked from the server |
| OpenTender | 403 | Also blocked from the server (Cloudflare) |
| ISSP (GESIS) | 403 | Landing page |
| OECD Trust Survey, TaxBEN calculator, PISA, Economic Survey of Norway | 403 | All four are pages on www.oecd.org. The OECD data API works |
| IMF Article IV page | 403 | A page on www.imf.org. The IMF data API works |
| Vannmiljø | 403 | |
| Kongehuset | 429 | Bot check, as from the server |
| Politiloggen | connection refused | As from the server |
| DSB brannstatistikk | timeout | |

Whether to send a browser-like User-Agent to the hosts that refuse ours is Egil's call. PLAN.md allows it per source (`user_agent: browser`); nothing does it yet.

### Sources that need a free key

NBIM voting records, PolitPro, Doffin, Helsedirektoratet NKI, NVE HydAPI, ENTSO-E, NOBIL, NILU, MET Frost, BarentsWatch, Vegvesen Autosys, EPO OPS, Vinmonopolet and FRED. The sign-up addresses are in `SOURCES.md` A2. MARPOR and Patentstyret also need keys for their data; their open pages answer.

### Corrections to the catalogue

- **SSB table 06035** (price per square metre) is discontinued; its last period is 2024. Of the 203 SSB table ids named in section 1b, 200 are active. The other two (13546, 13550) only appear inside a range.
- **Eurostat `spr_exp_sum`** gives 404. `spr_exp_func` and `spr_exp_type` work.
- **The JST Macrohistory address** ending in `.xlsx` serves a Stata `.dta` file.
- **Støtteregisteret** pages start at 1. `page=0` gives 500.
- **www.helseatlas.no** has a certificate for another host name. `helseatlas.no` works.
- **energimerking.no** doesn't resolve. The service is at `enova.no/energimerking`.
- **DBH**: the query API answers, but each table needs its own variable and filter names. The check points at the API client page until a real query is worked out.
- **Fastlegestatistikk** and **Samordna opptak søkertall**: the old addresses give 404. The checks point at the parent pages.
- **DFØ Innbyggerundersøkelsen** has a 2026 edition at `dfo.no/undersokelser/innbyggerundersokelsen-2026`.

## Adding or changing a check

Add an entry to `registry/source_checks.yaml`:

```yaml
- {id: my-source, section: "11", priority: B, name: "My source",
   url: "https://example.org/api/items?limit=1", expect: '"items"'}
```

Give `expect` (text in the body) or `expect_type` (text in the Content-Type header) whenever the endpoint returns data, so that the check can say `ok` rather than only `reachable`. Set `pii: true` if the response contains private persons. The other fields are described at the top of the file.
