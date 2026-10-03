"""Parse publisher period strings into a canonical period and the dates it starts and ends.

Canonical forms (PLAN.md §4): `2026`, `2026-Q2`, `2026-08`, `2026-W14`, `2026-08-31`.
Parsing a canonical period returns it unchanged.
"""

from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass
from datetime import date, timedelta
from functools import cache


@dataclass(frozen=True)
class Period:
    period: str
    period_start: date
    frequency: str  # A | Q | M | W | D


def _year(match: re.Match[str]) -> Period:
    year = int(match["year"])
    return Period(f"{year:04d}", date(year, 1, 1), "A")


def _quarter(match: re.Match[str]) -> Period:
    year, quarter = int(match["year"]), int(match["n"])
    return Period(f"{year:04d}-Q{quarter}", date(year, 3 * quarter - 2, 1), "Q")


def _month(match: re.Match[str]) -> Period:
    year, month = int(match["year"]), int(match["n"])
    return Period(f"{year:04d}-{month:02d}", date(year, month, 1), "M")


def _week(match: re.Match[str]) -> Period:
    year, week = int(match["year"]), int(match["n"])
    # ISO 8601 weeks, which is also what SSB uses: the period starts on the Monday.
    return Period(f"{year:04d}-W{week:02d}", date.fromisocalendar(year, week, 1), "W")


def _day(match: re.Match[str]) -> Period:
    day = date(int(match["year"]), int(match["month"]), int(match["day"]))
    return Period(day.isoformat(), day, "D")


# (pattern, builder). SSB writes months as 2026M08, quarters as 2026K2 and weeks as 2026U14.
_FORMATS: list[tuple[re.Pattern[str], Callable[[re.Match[str]], Period]]] = [
    (re.compile(r"(?P<year>\d{4})"), _year),
    (re.compile(r"(?P<year>\d{4})-?[KQ](?P<n>[1-4])"), _quarter),
    (re.compile(r"(?P<year>\d{4})M(?P<n>\d{2})"), _month),
    (re.compile(r"(?P<year>\d{4})-(?P<n>\d{2})"), _month),
    (re.compile(r"(?P<year>\d{4})-?[UW](?P<n>\d{2})"), _week),
    (re.compile(r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})"), _day),
]


@cache
def parse_period(raw: str) -> Period:
    """Parse one period string. Raises ValueError if it isn't a known format or a real date."""
    text = raw.strip()
    for pattern, build in _FORMATS:
        match = pattern.fullmatch(text)
        if match:
            try:
                return build(match)
            except ValueError as exc:
                raise ValueError(f"invalid period {raw!r}: {exc}") from exc
    raise ValueError(f"unrecognised period format: {raw!r}")


_MONTHS = {"A": 12, "Q": 3, "M": 1}


def period_end(raw: str) -> date:
    """The last day of a period: `2026` ends on 2026-12-31 and `2026-Q2` on 2026-06-30."""
    period = parse_period(raw)
    start = period.period_start
    if period.frequency == "D":
        return start
    if period.frequency == "W":
        return start + timedelta(days=6)
    months = start.month - 1 + _MONTHS[period.frequency]
    return date(start.year + months // 12, months % 12 + 1, 1) - timedelta(days=1)
