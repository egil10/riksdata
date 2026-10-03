# Riksdata 2.0: data pipeline quickstart

Riksdata 2.0 is built alongside the v1 site. This folder documents the Python pipeline that fetches statistics, stores them in one data model and checks them. The design is in `PLAN.md`, the product vision in `VISION.md`, and the source catalogue in `SOURCES.md`, all at the repository root.

Run every command from the repository root. You need [uv](https://docs.astral.sh/uv/); it installs Python 3.12 and the dependencies.

## Set up

```bash
uv sync
```

## Build the lake

```bash
uv run riksdata update                  # every dataset in registry/
uv run riksdata update --source ssb     # one source
uv run riksdata update --dataset kpi    # one dataset, by id or slug
uv run riksdata update --force          # refetch even if the publisher reports no change
uv run riksdata validate                # data-quality checks, writes lake/run_report.json
```

`update` asks each publisher whether a dataset has changed and skips it if neither the data nor its registry entry has. It prints one row per dataset and exits non-zero if any dataset failed. `validate` exits non-zero if a check fails; warnings don't fail it.

A full first run takes about 70 seconds: 21 calls to SSB and 31 to Our World in Data, the latter paced by our own rate cap.

## Query it

```bash
uv run riksdata sql "select source_id, count(*) as series from series group by 1 order by 1"
uv run riksdata sql "select period, value from observations_latest where series_id = 'ssb.14710.kpiindmnd' order by period_start desc limit 12"
uv run riksdata sql "select series_id, title_no, unit, last_period from series where topic = 'labour' order by 1"
```

The views are `sources`, `series`, `observations` and `observations_latest` (the newest vintage of each observation). The columns are listed in `PLAN.md` §4. You can also open `lake/riksdata.duckdb` with any DuckDB client.

## Find SSB tables

```bash
uv run riksdata catalog ssb --refresh             # download the catalogue (about 3,750 tables)
uv run riksdata catalog ssb --search sykefravær   # matches Norwegian and English titles
```

The catalogue is for discovery only. A table becomes part of Riksdata when it is added to `registry/datasets/ssb.yaml`.

## Check which sources can be reached

```bash
uv run riksdata check-sources                 # one small request to each of the 309 rows in SOURCES.md
uv run riksdata check-sources --status failed # re-check what failed last time
```

This doesn't ingest anything. It records whether each source answers, needs a key or is blocked. See [Source checks](source-checks.md) for the statuses and the latest results.

## What is in `lake/`

`lake/` is gitignored and can be deleted and rebuilt at any time.

| Path | Contents |
|---|---|
| `raw/<source>/<date>/` | Publisher responses as fetched, never overwritten, each with a `.meta.json` sidecar (URL, fetch time, extra metadata) |
| `parquet/series/`, `parquet/observations/` | The normalized tables, one file per dataset |
| `parquet/sources.parquet` | The sources from the registry |
| `parquet/catalog/` | Publisher catalogues |
| `riksdata.duckdb` | Views over the Parquet files. It holds no data itself |
| `source_checks/` | The latest `check-sources` report and the sampled start of each response |
| `state.json` | Per dataset: the publisher's last-changed time, a fingerprint of the registry entry, and the last successful fetch |
| `run_report.json` | The latest validation report, with counts per source and dataset |

## Tests and lint

```bash
uv run pytest -q                                          # offline, uses tests/fixtures/
uv run pytest -m live                                     # also calls SSB and OWID
uv run ruff check . && uv run ruff format --check .
```

## Sources

One page per adapter, with endpoints, limits, licence, quirks and the dataset list:

- [SSB](sources/ssb.md)
- [Our World in Data](sources/owid.md)

To add a dataset, add an entry to `registry/datasets/<source>.yaml` (format in `PLAN.md` §5) and run `update` for it.
