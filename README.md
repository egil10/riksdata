# Riksdata

**Norge som datasett.** Riksdata gathers official statistics about Norway, shows where every number comes from, and puts Norway next to other countries and its own history.

Two things live in this repository:

- **The live site** at [riksdata.org](https://riksdata.org) (version 1): a static dashboard of more than 120 datasets. It is frozen and will be replaced.
- **Riksdata 2.0**: a Python pipeline that fetches statistics from the publishers into one data model, checks them, and exports them for a new site. A preview is at [riksdata.org/beta](https://riksdata.org/beta/).

## Riksdata 2.0

You need [uv](https://docs.astral.sh/uv/). It installs Python 3.12 and the dependencies.

```bash
uv sync
uv run riksdata update      # fetch every dataset in registry/ into lake/
uv run riksdata validate    # data-quality checks
uv run riksdata sql "select series_id, title_no, last_period from series limit 10"
uv run pytest -q            # offline tests
```

The full quickstart is in [docs/v2/README.md](docs/v2/README.md).

Status in October 2026:

- **Two adapters**, Statistics Norway and Our World in Data: 113 series, about 26,600 observations.
- **318 sources catalogued and tested** in [SOURCES.md](SOURCES.md). What each one can give us is in the [source inventory](docs/v2/source-inventory.md).
- **Next**: adapters for the World Bank, the OECD and Stortinget, a nightly refresh, and the new site.

## What is where

| Path | What it is |
|---|---|
| `py/riksdata/` | The pipeline: adapters, registry, HTTP client, storage, validation, export, CLI |
| `registry/` | Which sources and datasets we fetch, and one small check per catalogued source |
| `tests/` | Offline tests with small recorded fixtures |
| `docs/v2/` | Documentation for the pipeline |
| `beta/` | The preview page and the data exported for it |
| `PLAN.md` | Architecture, data model and phases |
| `VISION.md` | Product vision and roadmap |
| `SOURCES.md` | The catalogue of sources worth integrating, with terms and privacy rules |
| `CLAUDE.md` | How work in this repository is done |
| `index.html`, `src/`, `data/`, `assets/`, `sw.js`, `docs/*.md` | Version 1, frozen until the new site takes over |

`lake/` (the fetched data) is not in git. It is rebuilt with `riksdata update`.

## Version 1

The live dashboard is plain HTML, CSS and JavaScript with its data committed under `data/`. To look at it locally:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Its own notes are in `docs/*.md`. Don't change version 1 files; they are served as they are until the cut-over described in `PLAN.md`.

## Data and licences

Every series carries its source, licence and retrieval date. Statistics Norway's data is CC BY 4.0 ("Kilde: Statistisk sentralbyrå"). Data from Our World in Data keeps the licence of each upstream provider. Where a licence is not an open one, the series carries a note on the terms, and the site stays non-commercial.

The code is under the MIT License, as this README has stated since version 1. There is no `LICENSE` file in the repository yet.
