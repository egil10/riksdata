"""Pydantic models and loader for `registry/sources.yaml` and `registry/datasets/*.yaml`.

The format is defined in PLAN.md §5. A dataset exists in Riksdata only if it is listed here.
"""

from __future__ import annotations

from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field, StrictStr, ValidationError

DEFAULT_REGISTRY_DIR = Path("registry")

Frequency = Literal["A", "Q", "M", "W", "D"]
Schedule = Literal["daily", "weekly", "monthly"]


class RegistryError(ValueError):
    """The registry files are missing, malformed or inconsistent."""


class RateLimit(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    calls: int = Field(gt=0)
    per_seconds: float = Field(gt=0)


class Source(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    source_id: str
    name: str
    publisher: str
    homepage: str
    api_base: str
    licence: str
    licence_url: str
    attribution: str
    rate_limit: RateLimit
    tier: int = Field(ge=1, le=4)
    access: Literal["api", "bulk", "scrape"]
    redistribution: Literal["open", "attribution", "restricted"]
    terms_checked: date
    timeout_seconds: float = Field(default=60, gt=0)
    # PLAN.md §5 (v3). Declared now so later adapters don't need a registry migration.
    runner: Literal["box", "actions", "mac"] = "box"  # where the fetch can run
    secret_env: str | None = None  # name of the env var holding the key, never the key
    encoding: str = "utf-8"  # file defaults for CSV-style sources
    delimiter: str = ","
    decimal: str = "."


class DatasetSpec(BaseModel):
    """One entry in `registry/datasets/<source>.yaml`.

    `select`, `series_key` and `entity` are used by SSB; `entities` by OWID. IDs are strict
    strings because YAML turns an unquoted `14710` into a number and `07321` into octal 3793.
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    source_id: str
    dataset: StrictStr
    slug: StrictStr
    title_no: str
    title_en: str | None = None
    topic: str
    frequency: Frequency | None = None
    schedule: Schedule
    superseded_by: StrictStr | None = None
    publish: bool
    # Shown beside the licence on the site. Required to publish data whose upstream licence
    # is not an open one (`validate` checks): it records that Egil has decided the terms allow it.
    terms_note: str | None = None
    # The dataset's zeros are real figures, so `validate` does not flag them (suspicious_zeros).
    real_zeros: bool = False
    pii: Literal["none", "aggregate", "hash_ids"] = "none"  # person-level data: PLAN.md §6
    chunk_by: dict[str, int] | None = None  # for tables above a publisher's request limit
    select: dict[str, list[StrictStr]] = Field(default_factory=dict)
    series_key: list[str] = Field(default_factory=list)
    entity: str | None = None
    entities: list[str] = Field(default_factory=list)

    @property
    def key(self) -> str:
        """`<source>/<dataset>`, the identifier used in state and reports."""
        return f"{self.source_id}/{self.dataset}"


class Registry(BaseModel):
    model_config = ConfigDict(frozen=True)

    sources: dict[str, Source]
    datasets: list[DatasetSpec]

    def select(self, source: str | None = None, dataset: str | None = None) -> list[DatasetSpec]:
        """Datasets matching a source id and/or a dataset id or slug."""
        return [
            ds
            for ds in self.datasets
            if (source is None or ds.source_id == source)
            and (dataset is None or dataset in (ds.dataset, ds.slug))
        ]


def read_yaml(path: Path) -> Any:
    """Parse a registry file. Raises RegistryError if it is missing or not valid YAML."""
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RegistryError(f"{path}: file not found") from exc
    except yaml.YAMLError as exc:
        raise RegistryError(f"{path}: invalid YAML: {exc}") from exc


def describe(exc: ValidationError) -> str:
    """A validation error as one line: `field: what is wrong; field: ...`."""
    return "; ".join(
        f"{'.'.join(str(part) for part in err['loc']) or '<entry>'}: {err['msg']}"
        for err in exc.errors()
    )


def load_registry(root: Path = DEFAULT_REGISTRY_DIR) -> Registry:
    """Load and cross-check the registry. Raises RegistryError with the file and entry at fault."""
    sources_path = root / "sources.yaml"
    raw_sources = read_yaml(sources_path)
    if not isinstance(raw_sources, dict):
        raise RegistryError(f"{sources_path}: expected a mapping of source id to settings")

    sources: dict[str, Source] = {}
    for source_id, body in raw_sources.items():
        try:
            sources[source_id] = Source(source_id=source_id, **(body or {}))
        except (ValidationError, TypeError) as exc:
            detail = describe(exc) if isinstance(exc, ValidationError) else str(exc)
            raise RegistryError(f"{sources_path}: source {source_id!r}: {detail}") from exc

    datasets: list[DatasetSpec] = []
    for path in sorted((root / "datasets").glob("*.yaml")):
        source = sources.get(path.stem)
        if source is None:
            raise RegistryError(
                f"{path}: no source {path.stem!r} in {sources_path} (known: {sorted(sources)})"
            )
        entries = read_yaml(path) or []
        if not isinstance(entries, list):
            raise RegistryError(f"{path}: expected a list of datasets")
        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                raise RegistryError(f"{path}: entry {index}: expected a mapping")
            if not isinstance(entry.get("dataset"), str):
                raise RegistryError(
                    f"{path}: entry {index}: `dataset` must be a quoted string, "
                    f"got {entry.get('dataset')!r} (YAML reads unquoted digits as a number)"
                )
            # Restricted sources stay in the lake and are never exported unless a dataset opts in.
            defaults = {
                "slug": entry.get("dataset"),
                "publish": source.redistribution != "restricted",
            }
            try:
                datasets.append(DatasetSpec(**{**defaults, **entry, "source_id": source.source_id}))
            except ValidationError as exc:
                name = entry.get("dataset", f"entry {index}")
                raise RegistryError(f"{path}: dataset {name!r}: {describe(exc)}") from exc

    for field in ("dataset", "slug"):
        counts = Counter((ds.source_id, getattr(ds, field)) for ds in datasets)
        duplicates = sorted(f"{source}/{value}" for (source, value), n in counts.items() if n > 1)
        if duplicates:
            raise RegistryError(f"duplicate {field} within a source: {', '.join(duplicates)}")

    return Registry(sources=sources, datasets=datasets)
