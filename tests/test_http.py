"""HTTP client: User-Agent, retries with backoff, and the sliding-window rate limiter."""

from collections.abc import Callable

import httpx
import pytest

from riksdata import __version__
from riksdata.http import HttpClient, HttpError, RateLimiter
from riksdata.registry import RateLimit
from support import FakeClock, make_source

URL = "https://example.org/api/tables"

Handler = Callable[[httpx.Request], httpx.Response]


def scripted(*steps: int | Exception | httpx.Response) -> tuple[Handler, list[httpx.Request]]:
    """A handler that plays back status codes, responses or exceptions in order."""
    remaining = list(steps)
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        step = remaining.pop(0)
        if isinstance(step, Exception):
            raise step
        if isinstance(step, httpx.Response):
            return step
        return httpx.Response(step, json={"status": step})

    return handler, seen


def make_client(handler: Handler, clock: FakeClock, **source_overrides: object) -> HttpClient:
    return HttpClient(
        make_source(**source_overrides),
        transport=httpx.MockTransport(handler),
        clock=clock,
        sleep=clock.sleep,
    )


def test_sends_user_agent_and_params() -> None:
    handler, seen = scripted(200)
    client = make_client(handler, FakeClock())

    response = client.get(URL, params={"lang": "no", "valueCodes[Tid]": "*"})

    assert response.json() == {"status": 200}
    assert seen[0].headers["User-Agent"] == f"riksdata/{__version__} (+https://riksdata.org)"
    assert dict(seen[0].url.params) == {"lang": "no", "valueCodes[Tid]": "*"}


def test_retries_429_then_succeeds() -> None:
    handler, seen = scripted(429, 429, 200)
    clock = FakeClock()

    response = make_client(handler, clock).get(URL)

    assert response.status_code == 200
    assert len(seen) == 3
    assert clock.sleeps == [1.0, 2.0]


def test_retry_after_header_is_honoured() -> None:
    handler, _ = scripted(httpx.Response(429, headers={"Retry-After": "7"}), 200)
    clock = FakeClock()

    make_client(handler, clock).get(URL)

    assert clock.sleeps == [7.0]


def test_retries_server_errors_and_timeouts() -> None:
    handler, seen = scripted(503, httpx.ReadTimeout("slow"), httpx.ConnectError("reset"), 200)
    clock = FakeClock()

    response = make_client(handler, clock).get(URL)

    assert response.status_code == 200
    assert len(seen) == 4
    assert clock.sleeps == [1.0, 2.0, 4.0]


def test_gives_up_after_five_retries() -> None:
    handler, seen = scripted(*[500] * 6)
    clock = FakeClock()

    with pytest.raises(HttpError, match="gave up on .* after 5 retries: HTTP 500"):
        make_client(handler, clock).get(URL)

    assert len(seen) == 6
    assert clock.sleeps == [1.0, 2.0, 4.0, 8.0, 16.0]


def test_client_errors_are_not_retried() -> None:
    handler, seen = scripted(httpx.Response(404, text="no such table"))
    clock = FakeClock()

    with pytest.raises(HttpError, match=r"HTTP 404 for https://example\.org/.*no such table"):
        make_client(handler, clock).get(URL)

    assert len(seen) == 1
    assert clock.sleeps == []


def test_follows_redirects() -> None:
    handler, seen = scripted(httpx.Response(301, headers={"Location": URL + "/moved"}), 200)

    response = make_client(handler, FakeClock()).get(URL)

    assert response.status_code == 200
    assert str(seen[1].url) == URL + "/moved"


def test_client_waits_for_the_source_rate_limit() -> None:
    handler, seen = scripted(200, 200, 200)
    clock = FakeClock()
    client = make_client(handler, clock, rate_limit=RateLimit(calls=2, per_seconds=10))

    for _ in range(3):
        client.get(URL)

    assert len(seen) == 3
    assert clock.sleeps == [10.0]


def test_rate_limiter_allows_a_burst_up_to_the_limit() -> None:
    clock = FakeClock()
    limiter = RateLimiter(3, 60, clock=clock, sleep=clock.sleep)

    for _ in range(3):
        limiter.acquire()

    assert clock.sleeps == []


def test_rate_limiter_never_exceeds_the_limit_in_any_window() -> None:
    clock = FakeClock()
    limiter = RateLimiter(3, 60, clock=clock, sleep=clock.sleep)
    stamps = []

    for i in range(10):
        limiter.acquire()
        stamps.append(clock.now)
        clock.now += 5 if i % 2 else 0  # uneven pacing between calls

    # Any 4 consecutive calls must span at least a full window.
    assert all(later - earlier >= 60 for earlier, later in zip(stamps, stamps[3:], strict=False))
