"""What every adapter shares: the Adapter protocol, RawArtifact, Batch and its schema check.

The column lists mirror the data model in PLAN.md §4.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Protocol

import polars as pl

from riksdata.registry import DatasetSpec

TAGS = ("DATA", "LAW", "ESTIMATE", "PROPOSAL")
ESTIMATE_BY = ("publisher", "riksdata")

SERIES_SCHEMA: dict[str, pl.DataType] = {
    "series_id": pl.String(),
    "source_id": pl.String(),
    "dataset_id": pl.String(),
    "dims": pl.String(),
    "title_no": pl.String(),
    "title_en": pl.String(),
    "unit": pl.String(),
    "unit_mult": pl.Int32(),
    "frequency": pl.String(),
    "concept": pl.String(),
    "coverage": pl.String(),
    "topic": pl.String(),
    "tag": pl.String(),
    "estimate_by": pl.String(),
    "publish": pl.Boolean(),
    "source_url": pl.String(),
    "citation": pl.String(),
    "licence": pl.String(),
    "first_period": pl.String(),
    "last_period": pl.String(),
    "source_updated": pl.Datetime("us", "UTC"),
    "retrieved_at": pl.Datetime("us", "UTC"),
}

OBSERVATIONS_SCHEMA: dict[str, pl.DataType] = {
    "series_id": pl.String(),
    "entity_id": pl.String(),
    "period": pl.String(),
    "period_start": pl.Date(),
    "value": pl.Float64(),
    "status": pl.String(),
    "vintage": pl.Date(),
}


@dataclass(frozen=True)
class RawArtifact:
    """One fetched response, exactly as the publisher sent it.

    `meta` holds any second document that `normalize` needs (for example English labels),
    so that normalizing stays a pure function of the artifact and the dataset spec.
    """

    url: str
    fetched_at: datetime
    content_type: str
    content: bytes
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class Batch:
    """Normalized output for one dataset."""

    series: pl.DataFrame
    observations: pl.DataFrame


class Adapter(Protocol):
    source_id: str

    def catalog(self, *, include_discontinued: bool = False) -> pl.DataFrame | None:
        """The publisher's full catalogue for discovery, if it has one."""

    def remote_updated(self, ds: DatasetSpec) -> datetime | None:
        """A cheap probe of when the publisher last changed the dataset."""

    def fetch(self, ds: DatasetSpec) -> RawArtifact:
        """Download the dataset. Network access goes through `riksdata.http` only."""

    def normalize(self, raw: RawArtifact, ds: DatasetSpec) -> Batch:
        """Turn a raw artifact into series and observations. Pure: no I/O, no clock."""


class BatchSchemaError(ValueError):
    """A batch does not match the series or observations schema."""


def schema_problems(
    actual: Mapping[str, pl.DataType], expected: Mapping[str, pl.DataType], name: str
) -> list[str]:
    """Differences between a schema and the expected one, as readable messages."""
    problems = [f"{name}: missing column {column!r}" for column in expected if column not in actual]
    problems += [
        f"{name}: unexpected column {column!r}" for column in actual if column not in expected
    ]
    problems += [
        f"{name}: column {column!r} is {actual[column]}, expected {dtype}"
        for column, dtype in expected.items()
        if column in actual and actual[column] != dtype
    ]
    if not problems and list(actual) != list(expected):
        problems.append(f"{name}: columns are out of order")
    return problems


def check_batch(batch: Batch) -> None:
    """Raise BatchSchemaError unless both frames match the PLAN.md §4 schemas exactly."""
    problems = schema_problems(batch.series.schema, SERIES_SCHEMA, "series") + schema_problems(
        batch.observations.schema, OBSERVATIONS_SCHEMA, "observations"
    )
    if problems:
        raise BatchSchemaError("; ".join(problems))
