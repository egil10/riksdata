"""The only module that talks to the network: per-source rate limiting, retries, User-Agent."""

from __future__ import annotations

import logging
import time
from collections import deque
from collections.abc import Callable, Mapping

import httpx

from riksdata import __version__
from riksdata.registry import Source

logger = logging.getLogger(__name__)

USER_AGENT = f"riksdata/{__version__} (+https://riksdata.org)"
MAX_RETRIES = 5
BACKOFF_SECONDS = 1.0  # doubles on every retry: 1, 2, 4, 8, 16
MAX_DELAY_SECONDS = 120.0


class HttpError(RuntimeError):
    """A request failed for good: a non-retryable status, or the retries ran out."""


class RateLimiter:
    """Sliding window: never more than `calls` requests in any `per_seconds` window.

    A token bucket of the same size lets through up to twice that right after an idle spell,
    which would break limits such as SSB's 40 calls per 60 seconds.
    """

    def __init__(
        self,
        calls: int,
        per_seconds: float,
        *,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        self._calls = calls
        self._per_seconds = per_seconds
        self._clock = clock
        self._sleep = sleep
        self._stamps: deque[float] = deque()

    def acquire(self) -> None:
        """Block until one more request fits in the window, then record it."""
        while True:
            now = self._clock()
            while self._stamps and now - self._stamps[0] >= self._per_seconds:
                self._stamps.popleft()
            if len(self._stamps) < self._calls:
                self._stamps.append(now)
                return
            self._sleep(self._per_seconds - (now - self._stamps[0]))


def _retry_delay(attempt: int, retry_after: str | None) -> float:
    delay = BACKOFF_SECONDS * 2**attempt
    if retry_after and retry_after.isdigit():
        delay = max(delay, float(retry_after))
    return min(delay, MAX_DELAY_SECONDS)


class HttpClient:
    """GET client for one source, configured from its registry entry.

    Retries 429, 5xx and transport errors (timeouts, dropped connections) with exponential
    backoff. Pass `transport=httpx.MockTransport(...)` in tests.
    """

    def __init__(
        self,
        source: Source,
        *,
        transport: httpx.BaseTransport | None = None,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        self._limiter = RateLimiter(
            source.rate_limit.calls, source.rate_limit.per_seconds, clock=clock, sleep=sleep
        )
        self._sleep = sleep
        self._client = httpx.Client(
            headers={"User-Agent": USER_AGENT},
            timeout=source.timeout_seconds,
            follow_redirects=True,
            transport=transport,
        )

    def get(self, url: str, params: Mapping[str, str] | None = None) -> httpx.Response:
        """GET `url` and return the response, or raise HttpError."""
        for attempt in range(MAX_RETRIES + 1):
            self._limiter.acquire()
            retry_after = None
            try:
                response = self._client.get(url, params=params)
            except httpx.TransportError as exc:
                problem = f"{type(exc).__name__}: {exc}"
            else:
                if response.status_code != 429 and response.status_code < 500:
                    if response.is_error:
                        raise HttpError(
                            f"HTTP {response.status_code} for {response.url}: {response.text[:300]}"
                        )
                    return response
                problem = f"HTTP {response.status_code}"
                retry_after = response.headers.get("Retry-After")
            if attempt == MAX_RETRIES:
                raise HttpError(f"gave up on {url} after {MAX_RETRIES} retries: {problem}")
            delay = _retry_delay(attempt, retry_after)
            logger.warning(
                "%s from %s; retry %d of %d in %.0f s",
                problem,
                url,
                attempt + 1,
                MAX_RETRIES,
                delay,
            )
            self._sleep(delay)
        raise AssertionError("unreachable")  # the loop always returns or raises

    def close(self) -> None:
        self._client.close()
