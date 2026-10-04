# Source checks

`riksdata check-sources` sends one small request to every source in `SOURCES.md` and records what came back. It answers one question: can this source be reached from the machine the command runs on? It does not ingest anything.

What the answers add up to is in the [source inventory](source-inventory.md): the results, what each source can give us, and what is blocked.

```bash
uv run riksdata check-sources                    # all 318 rows, about five minutes
uv run riksdata check-sources --section 19a      # one SOURCES.md section
uv run riksdata check-sources --only parlgov     # one source (repeatable)
uv run riksdata check-sources --status failed    # re-check what failed last time
```

The list of requests is `registry/source_checks.yaml`, one entry per catalogue row. The report is written to `lake/source_checks/latest.json` (and a dated copy). A partial run updates the entries it touched and keeps the rest. The command prints two tables: sources per status, and sources per access class and status.

## How a check behaves

- **One attempt, no retries.** A host that refuses us is asked once.
- **Paced per host:** at most one request every two seconds to the same host. A host that answers 429 gets no more requests in that run.
- **The OECD API gets 25 requests in a full run**, three of them for data. Its limit covers every request, structure calls too, so don't repeat a full run more than about twice an hour.
- **At most 64 KB is read**, then the connection is closed. A check never downloads a large file. A few entries raise the limit to read a whole web page. The size and the `Last-Modified` date the server states for the whole response are recorded (`total_bytes`, `last_modified`), except for compressed transfers.
- **Our own User-Agent**, `riksdata/<version> (+https://riksdata.org; <contact email>)`, with the address from `RIKSDATA_CONTACT_EMAIL`. It is never a browser's. No keys are sent.
- **A soft 404 counts as failed.** Some hosts answer 200 after redirecting to their not-found page (a wrong ECHR address ends at `/web/echr/page-404`). A 2xx answer whose final address has `404` in its path, after a redirect, is `failed`.
- **Person-level sources keep no sample.** Entries with `pii: true` (farm subsidies, vessel owners, candidate lists, court cases and so on) are checked in memory and nothing of the response is stored. For every other source, the sampled start of the response is kept under `lake/source_checks/samples/`, which is gitignored.
- **Never-use rows are not requested at all.** Skattelister, Finn, Proff, pollofpolls and the other rows that `SOURCES.md` A3 rules out are listed with `skip` and a reason. So are publications we only link to, and HUDOC, which has no official data API.

## Statuses

| Status | Meaning |
|---|---|
| `ok` | The endpoint answered and the expected content was in the response |
| `reachable` | A page or endpoint answered, but its content wasn't verified (mostly landing pages) |
| `needs_key` | The source wants a free key that we don't have yet |
| `blocked` | The host refused us: 401, 403, 429 or 451 |
| `unreachable` | No answer: timeout, DNS, connection or certificate error |
| `failed` | An answer, but not the expected one: 404, 5xx, wrong content or a soft 404 |
| `skipped` | Deliberately not requested |

## Access classes

Each entry says how the source hands out its data, which decides what kind of adapter it would need. The class is set by hand from what the source returned.

| Access | Meaning |
|---|---|
| `api` | A queryable API: REST, SDMX, PxWeb, GraphQL, ArcGIS and so on |
| `file` | A file at a stable address: CSV, Excel, ZIP and so on |
| `page` | Numbers on web pages: files whose addresses change, or HTML tables. The adapter has to find the links first |
| `docs` | Text documents (PDF or HTML): reports, rulings, programmes. They give text and events, not series |
| `manual` | Only through an interactive tool (Power BI, Qlik, Shiny), a login or an order form |
| `unknown` | The source answers, but no data route was found |
| `none` | No source of its own: derived metrics and never-use rows |

## When a host refuses us

We never send a browser-like User-Agent (Egil, 2026-10-03). A host that refuses ours gets its official API or bulk route instead, or we ask the publisher. Until then the row stays `blocked`.

A refusal can depend on where the request comes from. www.echr.coe.int is behind Cloudflare: our client gets its files from the server, and gets a challenge page (403) from Egil's Mac. Such a row is `ok` on one machine and `blocked` on the other. The HTTP client is not changed to get past a check like that.

## Adding or changing a check

Add an entry to `registry/source_checks.yaml`:

```yaml
- {id: my-source, section: "11", priority: B, access: api, name: "My source",
   url: "https://example.org/api/items?limit=1", expect: '"items"'}
```

Give `expect` (text in the body) or `expect_type` (text in the Content-Type header) whenever the endpoint returns data, so that the check can say `ok` rather than only `reachable`. `access` is required. Set `pii: true` if the response contains private persons. The other fields are described at the top of the file.
