"""The only module that talks to the network: per-source rate limiting, retries, User-Agent."""

from __future__ import annotations

import logging
import os
import time
from collections import deque
from collections.abc import Callable, Mapping
from dataclasses import dataclass

import httpx

from riksdata import __version__
from riksdata.registry import Source

logger = logging.getLogger(__name__)

CONTACT_PLACEHOLDER = "kontakt@riksdata.org"  # placeholder: Egil sets the real address


def contact_email(env: Mapping[str, str] = os.environ) -> str:
    """The address in our User-Agent: `RIKSDATA_CONTACT_EMAIL`, or the placeholder."""
    return env.get("RIKSDATA_CONTACT_EMAIL", "").strip() or CONTACT_PLACEHOLDER


def user_agent(env: Mapping[str, str] = os.environ) -> str:
    """Who we are and how to reach us. We never send a browser's User-Agent (CLAUDE.md §2)."""
    return f"riksdata/{__version__} (+https://riksdata.org; {contact_email(env)})"


USER_AGENT = user_agent()
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
    delay = BACKOFF_SECONDS * 2.0**attempt
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


@dataclass(frozen=True)
class Sample:
    """The start of a response: enough to tell whether an endpoint works."""

    status_code: int
    content_type: str
    content: bytes
    truncated: bool
    url: str  # after redirects
    seconds: float
    # Size of the whole response, when the server states it. Left out for compressed
    # transfers, where the stated length is not the size of what we read.
    total_bytes: int | None = None
    last_modified: str | None = None  # the Last-Modified header, as sent


class Sampler:
    """Reads the first bytes of arbitrary URLs: one attempt, paced per host.

    Used to check that a source can be reached, not to ingest data. It never retries, so a
    host that refuses us is asked once, and it stops reading after `max_bytes`, so a check
    never downloads a large file.
    """

    def __init__(
        self,
        *,
        seconds_between_calls: float = 2.0,
        transport: httpx.BaseTransport | None = None,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        self._pace = seconds_between_calls
        self._clock = clock
        self._sleep = sleep
        self._limiters: dict[str, RateLimiter] = {}
        self._client = httpx.Client(
            headers={"User-Agent": USER_AGENT}, follow_redirects=True, transport=transport
        )

    def fetch(
        self,
        url: str,
        *,
        method: str = "GET",
        headers: Mapping[str, str] | None = None,
        json: object = None,
        timeout: float = 30.0,
        max_bytes: int = 65_536,
    ) -> Sample:
        """Send one request and return at most `max_bytes` of the body.

        Raises `httpx.TransportError` if the host can't be reached or times out.
        """
        host = httpx.URL(url).host
        limiter = self._limiters.setdefault(
            host, RateLimiter(1, self._pace, clock=self._clock, sleep=self._sleep)
        )
        limiter.acquire()
        started = self._clock()
        chunks: list[bytes] = []
        size = 0
        truncated = False
        with self._client.stream(
            method, url, headers=headers, json=json, timeout=timeout
        ) as response:
            for chunk in response.iter_bytes():
                chunks.append(chunk)
                size += len(chunk)
                if size >= max_bytes:
                    truncated = True
                    break
        length = response.headers.get("content-length", "")
        compressed = "content-encoding" in response.headers
        return Sample(
            status_code=response.status_code,
            content_type=response.headers.get("content-type", ""),
            content=b"".join(chunks)[:max_bytes],
            truncated=truncated,
            url=str(response.url),
            seconds=self._clock() - started,
            total_bytes=int(length) if length.isdigit() and not compressed else None,
            last_modified=response.headers.get("last-modified"),
        )

    def close(self) -> None:
        self._client.close()
