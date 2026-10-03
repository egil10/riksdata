"""The `riksdata` command line interface: update | validate | catalog | sql.

Run it from the repository root: it reads `registry/` and writes `lake/`.
"""

from __future__ import annotations

import hashlib
import logging
import time
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated, Any

import duckdb
import polars as pl
import typer

from riksdata import storage, validate
from riksdata.adapters import build_adapter
from riksdata.adapters.base import Adapter, check_batch
from riksdata.http import HttpClient
from riksdata.registry import (
    DEFAULT_REGISTRY_DIR,
    DatasetSpec,
    Registry,
    RegistryError,
    load_registry,
)

logger = logging.getLogger(__name__)

app = typer.Typer(help="Riksdata 2.0 data pipeline.", no_args_is_help=True, add_completion=False)

LAKE = storage.DEFAULT_LAKE_DIR


@dataclass
class UpdateResult:
    dataset: str  # <source>/<dataset>
    status: str  # updated | unchanged | failed
    series: int
    observations: int
    seconds: float
    error: str | None = None


class _WarningCollector(logging.Handler):
    """Keeps warnings so the CLI can repeat them below the summary, where they get read."""

    def __init__(self) -> None:
        super().__init__(level=logging.WARNING)
        self.messages: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.messages.append(record.getMessage())


def _table(headers: Sequence[str], rows: Sequence[Sequence[Any]]) -> str:
    cells = [list(headers), *([str(cell) for cell in row] for row in rows)]
    widths = [max(len(row[i]) for row in cells) for i in range(len(headers))]
    lines = [
        "  ".join(cell.ljust(width) for cell, width in zip(row, widths, strict=True)).rstrip()
        for row in cells
    ]
    lines.insert(1, "  ".join("-" * width for width in widths))
    return "\n".join(lines)


def _load_registry() -> Registry:
    try:
        return load_registry(DEFAULT_REGISTRY_DIR)
    except RegistryError as exc:
        typer.echo(f"Registry error: {exc}", err=True)
        raise typer.Exit(2) from exc


def update_dataset(
    adapter: Adapter | None,
    ds: DatasetSpec,
    lake: Path,
    state: dict[str, dict[str, Any]],
    *,
    force: bool,
) -> UpdateResult:
    """Probe, fetch, archive, normalize and write one dataset. Never raises."""
    started = time.perf_counter()
    try:
        if adapter is None:
            raise ValueError(f"no adapter for source {ds.source_id!r}")
        remote = adapter.remote_updated(ds)
        marker = remote.isoformat() if remote else None
        # Skip only if neither the publisher's data nor our registry entry has changed.
        spec = hashlib.sha256(ds.model_dump_json().encode()).hexdigest()[:16]
        previous = state.get(ds.key, {})
        existing = storage.batch_counts(lake, ds)
        if (
            not force
            and existing is not None
            and marker is not None
            and marker == previous.get("source_updated")
            and spec == previous.get("spec")
        ):
            return UpdateResult(ds.key, "unchanged", *existing, time.perf_counter() - started)
        raw = adapter.fetch(ds)
        storage.archive_raw(lake, ds, raw)
        batch = adapter.normalize(raw, ds)
        check_batch(batch)
        storage.write_batch(lake, ds, batch)
        state[ds.key] = {
            "source_updated": marker,
            "spec": spec,
            "last_success": datetime.now(UTC).isoformat(timespec="seconds"),
        }
        storage.save_state(lake, state)
        return UpdateResult(
            ds.key,
            "updated",
            batch.series.height,
            batch.observations.height,
            time.perf_counter() - started,
        )
    except Exception as exc:  # one broken dataset must not stop the others
        logger.error("%s failed: %s", ds.key, exc, exc_info=logger.isEnabledFor(logging.DEBUG))
        return UpdateResult(ds.key, "failed", 0, 0, time.perf_counter() - started, error=str(exc))


def run_update(
    registry: Registry,
    adapters: Mapping[str, Adapter],
    lake: Path,
    *,
    source: str | None = None,
    dataset: str | None = None,
    force: bool = False,
) -> list[UpdateResult]:
    """Update the matching datasets, then rewrite `sources` and rebuild the DuckDB views."""
    state = storage.load_state(lake)
    results = []
    for ds in registry.select(source, dataset):
        result = update_dataset(adapters.get(ds.source_id), ds, lake, state, force=force)
        logger.info(
            "%s: %s (%d series, %d observations, %.1f s)",
            result.dataset,
            result.status,
            result.series,
            result.observations,
            result.seconds,
        )
        results.append(result)
    storage.write_sources(lake, registry.sources.values())
    storage.build_duckdb(lake)
    return results


@app.callback()
def main() -> None:
    """Riksdata 2.0 data pipeline."""
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)


@app.command("update")
def update_command(
    source: Annotated[str | None, typer.Option(help="Only this source id.")] = None,
    dataset: Annotated[str | None, typer.Option(help="Only this dataset id or slug.")] = None,
    force: Annotated[
        bool, typer.Option("--force", help="Fetch even if the publisher reports no change.")
    ] = False,
) -> None:
    """Fetch, archive and normalize datasets, then rebuild the DuckDB views."""
    registry = _load_registry()
    datasets = registry.select(source, dataset)
    if not datasets:
        typer.echo("No datasets in the registry match that source/dataset.", err=True)
        raise typer.Exit(1)

    collector = _WarningCollector()
    logging.getLogger().addHandler(collector)
    clients = {
        source_id: HttpClient(registry.sources[source_id])
        for source_id in sorted({ds.source_id for ds in datasets})
    }
    try:
        adapters: dict[str, Adapter] = {}
        for source_id, client in clients.items():
            try:
                adapters[source_id] = build_adapter(registry.sources[source_id], client)
            except ValueError as exc:
                logger.error("%s", exc)
        results = run_update(registry, adapters, LAKE, source=source, dataset=dataset, force=force)
    finally:
        for client in clients.values():
            client.close()
        logging.getLogger().removeHandler(collector)

    rows = [[r.dataset, r.series, r.observations, r.status, f"{r.seconds:.1f}"] for r in results]
    rows.append(
        [
            "total",
            sum(r.series for r in results),
            sum(r.observations for r in results),
            "",
            f"{sum(r.seconds for r in results):.1f}",
        ]
    )
    typer.echo(_table(["dataset", "series", "observations", "status", "seconds"], rows))
    if collector.messages:
        typer.echo("\nWarnings and errors:")
        for message in collector.messages:
            typer.echo(f"  - {message}")
    if any(result.status == "failed" for result in results):
        raise typer.Exit(1)


@app.command("validate")
def validate_command() -> None:
    """Run the data-quality checks and write lake/run_report.json."""
    report = validate.run(LAKE)
    for check in report["checks"]:
        typer.echo(f"{check['status'].upper():<4}  {check['name']}: {check['detail']}")
        for example in check["examples"]:
            typer.echo(f"        {example}")
    if report["sources"]:
        rows = [
            [source_id, counts["datasets"], counts["series"], counts["observations"]]
            for source_id, counts in report["sources"].items()
        ]
        typer.echo("\n" + _table(["source", "datasets", "series", "observations"], rows))
    typer.echo(f"\nValidation: {report['status']}. Report written to {LAKE / 'run_report.json'}")
    if report["status"] == "fail":
        raise typer.Exit(1)


@app.command("catalog")
def catalog_command(
    source: Annotated[str, typer.Argument(help="Source id, for example ssb.")],
    search: Annotated[
        str | None, typer.Option(help="Find tables whose title contains this text.")
    ] = None,
    refresh: Annotated[
        bool, typer.Option("--refresh", help="Download the catalogue again.")
    ] = False,
    include_discontinued: Annotated[
        bool, typer.Option("--include-discontinued", help="With --refresh: closed tables too.")
    ] = False,
) -> None:
    """Download or search a publisher's full table catalogue (for discovery only)."""
    registry = _load_registry()
    if source not in registry.sources:
        typer.echo(f"Unknown source {source!r}. Known: {sorted(registry.sources)}", err=True)
        raise typer.Exit(1)
    name = f"{source}_tables"

    if refresh:
        client = HttpClient(registry.sources[source])
        try:
            adapter = build_adapter(registry.sources[source], client)
            frame = adapter.catalog(include_discontinued=include_discontinued)
        finally:
            client.close()
        if frame is None:
            typer.echo(f"Source {source!r} has no catalogue.", err=True)
            raise typer.Exit(1)
        path = storage.write_catalog(LAKE, name, frame)
        typer.echo(f"Saved {frame.height} tables to {path}")

    frame = storage.read_catalog(LAKE, name)
    if frame is None:
        typer.echo(f"No catalogue yet. Run `riksdata catalog {source} --refresh`.", err=True)
        raise typer.Exit(1)
    if search is None:
        if not refresh:
            typer.echo(f"{frame.height} tables in the catalogue. Use --search TEXT to find one.")
        return

    needle = search.lower()
    hits = frame.filter(
        pl.any_horizontal(pl.col("^label.*$").str.to_lowercase().str.contains(needle, literal=True))
    ).sort("id")
    label = next(column for column in hits.columns if column.startswith("label"))
    rows = hits.select("id", "last_period", label).rows()
    typer.echo(_table(["id", "last_period", label], rows))
    typer.echo(f"\n{hits.height} of {frame.height} tables match {search!r}")


@app.command("sql")
def sql_command(
    query: Annotated[str, typer.Argument(help="SQL to run against lake/riksdata.duckdb.")],
) -> None:
    """Run a read-only SQL query against the lake and print the result."""
    try:
        connection = storage.connect(LAKE)
    except FileNotFoundError as exc:
        typer.echo(str(exc), err=True)
        raise typer.Exit(1) from exc
    try:
        relation = connection.sql(query)
        if relation is not None:
            relation.show(max_rows=10_000, max_width=200)
    except duckdb.Error as exc:
        typer.echo(f"SQL error: {exc}", err=True)
        raise typer.Exit(1) from exc
    finally:
        connection.close()
