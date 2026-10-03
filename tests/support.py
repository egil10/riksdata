"""Shared helpers for the test suite."""

from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Any

from riksdata.registry import RateLimit, Source

REPO_ROOT = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).resolve().parent / "fixtures"


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
