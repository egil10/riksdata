"""Shared helpers for the test suite."""

from __future__ import annotations

from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any

import polars as pl

from riksdata.adapters.base import OBSERVATIONS_SCHEMA, SERIES_SCHEMA, Batch
from riksdata.periods import parse_period
from riksdata.registry import DatasetSpec, RateLimit, Source

REPO_ROOT = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).resolve().parent / "fixtures"

RETRIEVED_AT = datetime(2026, 10, 3, 9, 0, tzinfo=UTC)

_SOURCE_YAML = """
{source_id}:
  name: Demo source
  publisher: Demo publisher
  homepage: https://example.org
  api_base: https://example.org/api
  licence: CC-BY-4.0
  licence_url: https://example.org/licence
  attribution: "Source: Demo"
  rate_limit: {{calls: 10, per_seconds: 60}}
  tier: 2
  access: api
  redistribution: {redistribution}
  terms_checked: 2026-10-03
"""


def write_registry(
    root: Path,
    datasets: dict[str, str],
    sources: dict[str, str] | None = None,
) -> Path:
    """Write registry YAML files under `root`.

    `datasets` maps a source id to the YAML body of its datasets file. `sources` maps a
    source id to its `redistribution` setting and defaults to one open source, `demo`.
    """
    sources = sources or {"demo": "attribution"}
    (root / "datasets").mkdir(parents=True)
    (root / "sources.yaml").write_text(
        "".join(
            _SOURCE_YAML.format(source_id=source_id, redistribution=redistribution)
            for source_id, redistribution in sources.items()
        ),
        encoding="utf-8",
    )
    for source_id, body in datasets.items():
        (root / "datasets" / f"{source_id}.yaml").write_text(body, encoding="utf-8")
    return root


def make_source(**overrides: Any) -> Source:
    """A valid registry source; pass keyword overrides for the fields a test cares about."""
    fields: dict[str, Any] = {
        "source_id": "demo",
        "name": "Demo source",
        "publisher": "Demo publisher",
        "homepage": "https://example.org",
        "api_base": "https://example.org/api",
        "licence": "CC-BY-4.0",
        "licence_url": "https://example.org/licence",
        "attribution": "Source: Demo",
        "rate_limit": RateLimit(calls=1000, per_seconds=60),
        "tier": 2,
        "access": "api",
        "redistribution": "attribution",
        "terms_checked": date(2026, 10, 3),
    }
    return Source(**{**fields, **overrides})


def make_dataset(**overrides: Any) -> DatasetSpec:
    """A valid registry dataset, `demo/ds` unless overridden."""
    fields: dict[str, Any] = {
        "source_id": "demo",
        "dataset": "ds",
        "slug": "ds",
        "title_no": "Demodatasett",
        "title_en": "Demo dataset",
        "topic": "demo",
        "frequency": "A",
        "schedule": "daily",
        "publish": True,
    }
    return DatasetSpec(**{**fields, **overrides})


class FakeClock:
    """A clock that only moves when something sleeps on it."""

    def __init__(self) -> None:
        self.now = 0.0
        self.sleeps: list[float] = []

    def __call__(self) -> float:
        return self.now

    def sleep(self, seconds: float) -> None:
        self.sleeps.append(seconds)
        self.now += seconds


def make_batch(
    *series_ids: str,
    periods: tuple[str, ...] = ("2024", "2025"),
    vintage: date = date(2026, 10, 3),
    **series_overrides: Any,
) -> Batch:
    """A valid batch: one row per series, and one NOR observation per series and period.

    Series ids must look like `<source>.<dataset>.<key>`. Values count up from 1.0.
    """
    rows = []
    observations = []
    for series_id in series_ids or ("demo.ds.a",):
        source_id, dataset_id, _ = series_id.split(".", 2)
        row = {
            "series_id": series_id,
            "source_id": source_id,
            "dataset_id": dataset_id,
            "dims": "{}",
            "title_no": "Demoserie",
            "title_en": "Demo series",
            "unit": "index",
            "unit_mult": 0,
            "frequency": parse_period(periods[0]).frequency,
            "concept": None,
            "coverage": None,
            "topic": "demo",
            "tag": "DATA",
            "estimate_by": None,
            "publish": True,
            "source_url": "https://example.org/table",
            "citation": "Source: Demo",
            "licence": "CC-BY-4.0",
            "first_period": periods[0],
            "last_period": periods[-1],
            "source_updated": RETRIEVED_AT,
            "retrieved_at": RETRIEVED_AT,
        }
        rows.append({**row, **series_overrides})
        for index, period in enumerate(periods):
            observations.append(
                {
                    "series_id": series_id,
                    "entity_id": "NOR",
                    "period": period,
                    "period_start": parse_period(period).period_start,
                    "value": float(index + 1),
                    "status": None,
                    "vintage": vintage,
                }
            )
    return Batch(
        series=pl.DataFrame(rows, schema=SERIES_SCHEMA),
        observations=pl.DataFrame(observations, schema=OBSERVATIONS_SCHEMA),
    )
