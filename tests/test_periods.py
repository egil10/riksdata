"""Period parsing: publisher formats to canonical period and start date."""

from datetime import date

import pytest

from riksdata.periods import parse_period, period_end

# (publisher string, canonical period, period start, frequency)
VALID = [
    ("2026", "2026", date(2026, 1, 1), "A"),
    ("1735", "1735", date(1735, 1, 1), "A"),
    ("0850", "0850", date(850, 1, 1), "A"),
    ("2026M08", "2026-08", date(2026, 8, 1), "M"),
    ("1920M03", "1920-03", date(1920, 3, 1), "M"),
    ("2026-08", "2026-08", date(2026, 8, 1), "M"),
    ("2026K1", "2026-Q1", date(2026, 1, 1), "Q"),
    ("2026K2", "2026-Q2", date(2026, 4, 1), "Q"),
    ("2026Q3", "2026-Q3", date(2026, 7, 1), "Q"),
    ("2026-Q4", "2026-Q4", date(2026, 10, 1), "Q"),
    ("2026U14", "2026-W14", date(2026, 3, 30), "W"),
    ("2026W14", "2026-W14", date(2026, 3, 30), "W"),
    ("2026-W14", "2026-W14", date(2026, 3, 30), "W"),
    # ISO week 1 of 2026 starts in December 2025.
    ("2026U01", "2026-W01", date(2025, 12, 29), "W"),
    # 2026 is a 53-week year.
    ("2026U53", "2026-W53", date(2026, 12, 28), "W"),
    ("2026-08-31", "2026-08-31", date(2026, 8, 31), "D"),
    ("2024-02-29", "2024-02-29", date(2024, 2, 29), "D"),
    (" 2026M08 ", "2026-08", date(2026, 8, 1), "M"),
]

INVALID = [
    "",
    "abc",
    "26",
    "20260",
    "2026M8",
    "2026M13",
    "2026-13",
    "2026K0",
    "2026K5",
    "2026U00",
    "2025U53",  # 2025 has 52 ISO weeks
    "2026H1",
    "2026-02-30",
    "2026-8-31",
    "0000",
]


@pytest.mark.parametrize(("raw", "period", "start", "frequency"), VALID)
def test_parse_period(raw: str, period: str, start: date, frequency: str) -> None:
    parsed = parse_period(raw)

    assert parsed.period == period
    assert parsed.period_start == start
    assert parsed.frequency == frequency


@pytest.mark.parametrize("raw", [case[0] for case in VALID])
def test_canonical_form_parses_to_itself(raw: str) -> None:
    parsed = parse_period(raw)

    assert parse_period(parsed.period) == parsed


@pytest.mark.parametrize("raw", INVALID)
def test_invalid_period_raises(raw: str) -> None:
    with pytest.raises(ValueError, match="period"):
        parse_period(raw)


@pytest.mark.parametrize(
    ("raw", "end"),
    [
        ("2026", date(2026, 12, 31)),
        ("2026-Q1", date(2026, 3, 31)),
        ("2026K4", date(2026, 12, 31)),
        ("2026-08", date(2026, 8, 31)),
        ("2026M12", date(2026, 12, 31)),
        ("2024-02", date(2024, 2, 29)),  # leap year
        ("2026-W14", date(2026, 4, 5)),  # Monday 30 March to Sunday 5 April
        ("2026-W53", date(2027, 1, 3)),
        ("2026-08-31", date(2026, 8, 31)),
    ],
)
def test_period_end(raw: str, end: date) -> None:
    assert period_end(raw) == end
