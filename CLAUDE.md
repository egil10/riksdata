# CLAUDE.md

Instructions for Claude Code working in this repo. **Read `PLAN.md` first** (architecture, data model, phases), and consult `VISION.md` (product and roadmap) and `SOURCES.md` (source catalogue, terms) when a task touches them. This file defines *how* we work.

## 0. Project context (read every session)
- Riksdata 2.0 is being built **alongside** the frozen v1 site. v1 files (`index.html`, `src/`, `data/`, `sw.js`, `assets/`, `docs/*.md` at the top level of docs/) are live on GitHub Pages at riksdata.org. **Don't modify, move or delete v1 files** unless the task explicitly says it's the Phase 2 cut-over.
- v2 code lives in: `py/riksdata/` (Python package), `registry/`, `tests/`, `docs/v2/`, `beta/` (the stopgap page at riksdata.org/beta/ and its exported data), `site/` (Phase 2) and `.github/workflows/`.
- Session prompts and reviews from the planning chat arrive in `.handoff/` at the repo root. It is git-ignored: read it at the start of a session, and never commit it.
- The owner (Egil) is strong in Python/ML and works on a Mac with uv and Python 3.12. Prefer clear, typed, boring Python over clever code.

## 1. Workflow
1. **Plan before coding.** Restate the task, list assumptions, and write a short numbered plan with a verification step for each item. If something in PLAN.md conflicts with the task, stop and ask.
2. **One branch per task**: `v2/<NN>-<short-slug>` (e.g. `v2/01-scaffold`, `v2/02-stortinget`). Never commit to `main` directly.
3. **Small PRs.** One adapter or one concern per PR. Aim for under ~600 changed lines excluding fixtures and lockfiles. If it's growing beyond that, split it and say so.
4. **Commit in logical steps** with imperative messages (`Add SSB adapter normalize()`), not one giant commit.
5. **Before opening a PR, run all of these and paste the results in the PR description:**
   ```bash
   uv run ruff check . && uv run ruff format --check .
   uv run pytest -q
   uv run riksdata update --source <sources touched>   # live run
   uv run riksdata validate
   ```
   If a live run fails because of the network or a rate limit, say so explicitly in the PR rather than hiding it.
6. **PR description template:** What & why · How to test · Commands run + output summary (row counts per source, validation result) · Registry/doc changes · Known limitations / follow-ups.
7. **End of session:** stop and summarise what was done, what's left, any decisions made, and anything that needs Egil (secrets, repo settings, judgement calls). Don't start the next task unprompted.
8. **Don't merge PRs, force-push, rewrite history, change repo settings, or create releases/secrets** unless explicitly asked.

## 2. Python conventions
- **uv only**: `uv add <pkg>`, `uv add --dev <pkg>`, `uv run …`. Never `pip install`. Commit `uv.lock`. Python 3.12.
- Core deps: httpx, polars, pyarrow, duckdb, pydantic, pyyaml, typer. Dev: pytest, ruff. **Ask before adding any other dependency.**
- Type hints everywhere. Pydantic for anything loaded from YAML or external JSON configs.
- Ruff for lint and format (line length 100).
- Network I/O only through `riksdata.http` (rate limiting, retries, User-Agent `riksdata/<version> (+https://riksdata.org; <contact email>)`). File I/O only through `riksdata.storage`.
- Never send a browser-like or spoofed User-Agent. If a host refuses `riksdata/…`, use its official API or bulk download, or ask the publisher, and record the source as `blocked` meanwhile.
- Adapter `normalize()` must be a pure function of `(raw, dataset_spec)`.
- Log with the stdlib `logging` module, not print (the CLI may print summaries).

## 3. Testing
- pytest. **The default test run is offline**: use recorded fixtures in `tests/fixtures/<source>/` and `httpx.MockTransport`.
- Fixtures must be **small** (trimmed to a few series/periods, ideally under 50 KB each, never over 200 KB). Write a helper or document how each fixture was recorded.
- Live smoke tests are marked `@pytest.mark.live` and excluded by default (`-m "not live"` in config). Run them with `uv run pytest -m live`.
- Every adapter needs at least: a normalize test on a fixture (row counts, dtypes, a known value), a period-parsing test, and a test that the registry entries for it validate.
- Bug fix = failing test first, then the fix.

## 4. Data rules
- **Never commit data blobs.** `lake/` is gitignored. Don't commit any file over **1 MB**, and never commit raw API responses outside trimmed test fixtures. (v1's existing `data/` is grandfathered. Don't add to it.)
- Raw responses are archived by `storage.py` to `lake/raw/<source>/<YYYY-MM-DD>/…` and never overwritten within a day.
- Every series must have `unit`, `licence`, `source_url`, `retrieved_at` and a tag (`DATA|LAW|ESTIMATE|PROPOSAL`; our own calculations are `ESTIMATE` with `estimate_by = riksdata`). `validate` fails otherwise.
- Respect publisher limits (see `registry/sources.yaml`): SSB 40/min, Stortinget 100/min, OECD **60 calls/hour, structure calls included**. Never hammer an API in a loop without the limiter. Cache immutable things (e.g. Stortinget vote results by `votering_id`).
- Respect `redistribution`/`publish` in the registry: restricted sources never reach `site/` exports. Never scrape a site whose terms forbid it (e.g. lovdata.no web, pollofpolls.no without permission, skattelister). Use the sanctioned API or skip it.
- **Privacy and terms (binding; full list in SOURCES.md Appendix A3):** person-level registers (`pii` ≠ none) are hashed or aggregated inside `normalize` and never reach `clean/` as raw IDs or names. Never use skattelister, person-level aksjonærregister or beneficial-owner data. Never scrape Finn, Proff, lovdata.no or pollofpolls. NC/SA-licensed sources (ESS, JST, Atlas ECI, MARPOR, WHO GHO, OpenTender) stay `publish: false` unless Egil decides otherwise. Keys come from env/GitHub secrets (`secret_env`), never from files in the repo.
- Don't invent data. If a value or code can't be verified from the source, leave it out and note it.
- Registry models are strict (`extra="forbid"`): a new registry field goes into the pydantic model, with a default and a test, in the PR that first uses it.
- Publisher quirks (e.g. SSB publishing `0` for missing years) are handled in the registry (leave the codes out of `select`) and documented in `docs/v2/sources/<source>.md`, not hard-coded in adapters.
- Credit sources per their licence (SSB: "Kilde: Statistisk sentralbyrå"; Stortinget: NLOD, credit Stortinget; OWID: per-series citation).

## 5. Registry & docs (required with every adapter PR)
- Add or adjust the source in `registry/sources.yaml` and its datasets in `registry/datasets/<source>.yaml`.
- Add or update `docs/v2/sources/<source>.md`: endpoints used, auth, rate limits, licence, quirks/gotchas, how fixtures were recorded, and the list of datasets.
- If you change the data model or architecture, update `PLAN.md` in the same PR.

## 6. Behavioural guidelines
**Tradeoff:** these guidelines bias toward caution over speed. For trivial tasks, use judgment.

### Think before coding
Don't assume. Don't hide confusion. Surface tradeoffs.
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them; don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

### Simplicity first
Write the minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked. No abstractions for single-use code. No configurability that wasn't requested.
- If you wrote 200 lines and it could be 50, rewrite it.

### Surgical changes
Touch only what you must. Clean up only your own mess.
- Don't "improve" adjacent code, comments or formatting. Match existing style.
- If you notice unrelated dead code, mention it; don't delete it.
- Remove imports/variables/functions that *your* changes made unused.

### Goal-driven execution
Define success criteria and loop until they're verified.
- "Add adapter X" → "fixture-based normalize test passes, live `riksdata update --source X` produces N series, `validate` is green".
