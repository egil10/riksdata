"""All file I/O for the lake: raw archive, Parquet tables, DuckDB views, state and reports.

Layout under `lake/` (gitignored):

    raw/<source>/<YYYY-MM-DD>/<dataset>.<ext>            publisher responses, never overwritten
    raw/<source>/<YYYY-MM-DD>/<dataset>.meta.json        url, fetch time and RawArtifact.meta
    parquet/series/source=<id>/<dataset>.parquet
    parquet/observations/source=<id>/<dataset>.parquet
    parquet/sources.parquet                              from the registry
    parquet/catalog/<name>.parquet                       publisher catalogues, for discovery
    riksdata.duckdb                                      views over the Parquet, no data
    source_checks/latest.json, source_checks/<date>.json  results of `riksdata check-sources`
    source_checks/samples/<id>.<ext>                      first bytes of each checked response
    state.json, run_report.json
"""

from __future__ import annotations

import json
import os
from collections.abc import Callable, Iterable
from datetime import UTC
from pathlib import Path
from typing import Any

import duckdb
import polars as pl

from riksdata.adapters.base import OBSERVATIONS_SCHEMA, SERIES_SCHEMA, Batch, RawArtifact
from riksdata.registry import DatasetSpec, Source

DEFAULT_LAKE_DIR = Path("lake")

_EXTENSIONS = {
    "application/json": "json",
    "text/csv": "csv",
    "text/html": "html",
    "application/xml": "xml",
    "text/xml": "xml",
}
_TABLE_SCHEMAS = {"series": SERIES_SCHEMA, "observations": OBSERVATIONS_SCHEMA}

# view name -> files under lake/parquet/. `entities` is not written yet (PLAN.md §4).
_VIEWS = {
    "sources": "sources.parquet",
    "entities": "entities.parquet",
    "series": "series/*/*.parquet",
    "observations": "observations/*/*.parquet",
}

_SOURCES_SCHEMA: dict[str, pl.DataType] = {
    "source_id": pl.String(),
    "name": pl.String(),
    "publisher": pl.String(),
    "homepage": pl.String(),
    "api_base": pl.String(),
    "licence": pl.String(),
    "licence_url": pl.String(),
    "attribution": pl.String(),
    "rate_limit_calls": pl.Int32(),
    "rate_limit_seconds": pl.Float64(),
    "tier": pl.Int32(),
    "access": pl.String(),
    "redistribution": pl.String(),
    "terms_checked": pl.Date(),
    "timeout_seconds": pl.Float64(),
}


def _replace(path: Path, write: Callable[[Path], object]) -> None:
    """Write via a temporary file so an interrupted run never leaves a half-written file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    write(tmp)
    os.replace(tmp, path)


def _write_json(path: Path, payload: Any) -> None:
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    _replace(path, lambda tmp: tmp.write_text(text, encoding="utf-8"))


def _read_json(path: Path) -> Any | None:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


# --- raw archive -----------------------------------------------------------------------------


def _extension(content_type: str) -> str:
    return _EXTENSIONS.get(content_type.split(";")[0].strip().lower(), "bin")


def archive_raw(lake: Path, ds: DatasetSpec, raw: RawArtifact) -> Path:
    """Archive a raw response under its fetch date (UTC) and return the path.

    A second fetch on the same day is stored as `<dataset>.2.<ext>` and so on.
    """
    folder = lake / "raw" / ds.source_id / raw.fetched_at.astimezone(UTC).date().isoformat()
    folder.mkdir(parents=True, exist_ok=True)
    extension = _extension(raw.content_type)
    attempt = 1
    while True:
        stem = ds.dataset if attempt == 1 else f"{ds.dataset}.{attempt}"
        path = folder / f"{stem}.{extension}"
        try:
            with path.open("xb") as handle:  # "x" refuses to overwrite
                handle.write(raw.content)
            break
        except FileExistsError:
            attempt += 1
    sidecar = {
        "url": raw.url,
        "fetched_at": raw.fetched_at.isoformat(),
        "content_type": raw.content_type,
        "meta": raw.meta,
    }
    _write_json(folder / f"{stem}.meta.json", sidecar)
    return path


# --- parquet tables --------------------------------------------------------------------------


def _batch_path(lake: Path, table: str, ds: DatasetSpec) -> Path:
    return lake / "parquet" / table / f"source={ds.source_id}" / f"{ds.dataset}.parquet"


def write_batch(lake: Path, ds: DatasetSpec, batch: Batch) -> None:
    """Replace the dataset's normalized series and observations."""
    _replace(_batch_path(lake, "series", ds), batch.series.write_parquet)
    _replace(_batch_path(lake, "observations", ds), batch.observations.write_parquet)


def batch_counts(lake: Path, ds: DatasetSpec) -> tuple[int, int] | None:
    """(series, observations) row counts already in the lake for a dataset, if any."""
    paths = [_batch_path(lake, table, ds) for table in ("series", "observations")]
    if not all(path.exists() for path in paths):
        return None
    series, observations = (
        pl.scan_parquet(path).select(pl.len()).collect().item() for path in paths
    )
    return series, observations


def table_files(lake: Path, table: str) -> list[Path]:
    """The Parquet files that make up `series` or `observations`."""
    return sorted((lake / "parquet").glob(_VIEWS[table]))


def read_schema(path: Path) -> dict[str, pl.DataType]:
    return dict(pl.read_parquet_schema(path))


def read_table(lake: Path, table: str) -> pl.DataFrame:
    """All rows of `series` or `observations` across datasets."""
    files = table_files(lake, table)
    if not files:
        return pl.DataFrame(schema=_TABLE_SCHEMAS[table])
    return pl.concat([pl.read_parquet(path) for path in files])


def write_sources(lake: Path, sources: Iterable[Source]) -> Path:
    """Write the registry's sources as `parquet/sources.parquet`."""
    rows = [
        {
            **source.model_dump(exclude={"rate_limit"}),
            "rate_limit_calls": source.rate_limit.calls,
            "rate_limit_seconds": source.rate_limit.per_seconds,
        }
        for source in sources
    ]
    path = lake / "parquet" / "sources.parquet"
    _replace(path, pl.DataFrame(rows, schema=_SOURCES_SCHEMA).write_parquet)
    return path


def write_catalog(lake: Path, name: str, frame: pl.DataFrame) -> Path:
    path = lake / "parquet" / "catalog" / f"{name}.parquet"
    _replace(path, frame.write_parquet)
    return path


def read_catalog(lake: Path, name: str) -> pl.DataFrame | None:
    path = lake / "parquet" / "catalog" / f"{name}.parquet"
    return pl.read_parquet(path) if path.exists() else None


# --- duckdb ----------------------------------------------------------------------------------


def build_duckdb(lake: Path) -> Path:
    """(Re)create `riksdata.duckdb` with views over the Parquet files. No data is copied in."""
    parquet = (lake / "parquet").resolve()
    path = lake / "riksdata.duckdb"
    tmp = path.with_name(path.name + ".tmp")
    tmp.unlink(missing_ok=True)
    connection = duckdb.connect(str(tmp))
    try:
        for view, pattern in _VIEWS.items():
            if not any(parquet.glob(pattern)):
                continue
            files = str(parquet / pattern).replace("'", "''")
            connection.execute(
                f"CREATE VIEW {view} AS SELECT * FROM read_parquet("
                f"'{files}', union_by_name = true, hive_partitioning = false)"
            )
            if view == "observations":
                connection.execute(
                    "CREATE VIEW observations_latest AS SELECT * FROM observations "
                    "QUALIFY row_number() OVER ("
                    "PARTITION BY series_id, entity_id, period ORDER BY vintage DESC) = 1"
                )
    finally:
        connection.close()
    os.replace(tmp, path)
    return path


def connect(lake: Path) -> duckdb.DuckDBPyConnection:
    """Open `riksdata.duckdb` read-only."""
    path = lake / "riksdata.duckdb"
    if not path.exists():
        raise FileNotFoundError(f"{path} does not exist yet; run `riksdata update` first")
    return duckdb.connect(str(path), read_only=True)


# --- state and reports -----------------------------------------------------------------------


def load_state(lake: Path) -> dict[str, dict[str, Any]]:
    """Per-dataset `source_updated`, `spec` (registry fingerprint) and `last_success`.

    Keyed by `<source>/<dataset>`.
    """
    return _read_json(lake / "state.json") or {}


def save_state(lake: Path, state: dict[str, dict[str, Any]]) -> None:
    _write_json(lake / "state.json", state)


def read_run_report(lake: Path) -> dict[str, Any] | None:
    return _read_json(lake / "run_report.json")


def write_run_report(lake: Path, report: dict[str, Any]) -> Path:
    path = lake / "run_report.json"
    _write_json(path, report)
    return path


# --- source checks ---------------------------------------------------------------------------


def read_source_checks(lake: Path) -> dict[str, Any] | None:
    return _read_json(lake / "source_checks" / "latest.json")


def write_source_checks(lake: Path, report: dict[str, Any]) -> Path:
    """Write the report as `latest.json` and as a dated copy."""
    folder = lake / "source_checks"
    _write_json(folder / f"{report['generated_at'][:10]}.json", report)
    _write_json(folder / "latest.json", report)
    return folder / "latest.json"


def write_source_sample(lake: Path, check_id: str, content: bytes, content_type: str) -> Path:
    """Keep the sampled start of a response, replacing any earlier sample for the check."""
    path = lake / "source_checks" / "samples" / f"{check_id}.{_extension(content_type)}"
    for stale in path.parent.glob(f"{check_id}.*"):
        stale.unlink()
    _replace(path, lambda tmp: tmp.write_bytes(content))
    return path
