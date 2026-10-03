"""Check that the sources in SOURCES.md can be reached, with one small request each.

`registry/source_checks.yaml` holds one entry per catalogue row. A check never ingests data:
it reads at most the first bytes of one response and records what came back. Statuses:

    ok           the endpoint answered and the expected content was there
    reachable    the page or endpoint answered; its content was not verified
    needs_key    the source wants a (free) key that we don't have
    blocked      the host refused us (401, 403, 429)
    unreachable  no answer: timeout, DNS, connection or TLS error
    failed       an answer, but not the expected one (404, 5xx, wrong content)
    skipped      deliberately not requested (see the entry's `skip` reason)
"""

from __future__ import annotations

from collections import Counter, deque
from collections.abc import Callable, Iterable, Sequence
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Literal

import httpx
import yaml
from pydantic import BaseModel, ConfigDict, Field, StrictStr, ValidationError, model_validator

from riksdata.http import Sample, Sampler
from riksdata.registry import DEFAULT_REGISTRY_DIR, RegistryError

DEFAULT_CHECKS_FILE = DEFAULT_REGISTRY_DIR / "source_checks.yaml"

Status = Literal["ok", "reachable", "needs_key", "blocked", "unreachable", "failed", "skipped"]
STATUSES: tuple[Status, ...] = (
    "ok",
    "reachable",
    "needs_key",
    "blocked",
    "unreachable",
    "failed",
    "skipped",
)


class SourceCheck(BaseModel):
    """One entry in `registry/source_checks.yaml`."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    id: str = Field(pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    section: StrictStr  # SOURCES.md section, e.g. "19a"
    name: str
    priority: Literal["A", "B", "C", "-"]
    url: str | None = None
    method: Literal["GET", "POST"] = "GET"
    headers: dict[str, str] = Field(default_factory=dict)
    body: Any = None  # sent as JSON
    expect: str | None = None  # text that must be in the sampled body
    expect_type: str | None = None  # text that must be in the Content-Type header
    encoding: str = "utf-8"  # how to decode the body before looking for `expect`
    needs_key: str | None = None  # env var that would hold the key
    pii: bool = False  # the response holds person-level data: never keep a sample
    skip: str | None = None  # why this row is not requested at all
    timeout: float = Field(default=30, gt=0)
    max_bytes: int = Field(default=65_536, gt=0, le=4_000_000)
    note: str | None = None

    @model_validator(mode="after")
    def _url_or_skip(self) -> SourceCheck:
        if (self.url is None) == (self.skip is None):
            raise ValueError("give exactly one of `url` and `skip`")
        return self


@dataclass
class CheckResult:
    id: str
    section: str
    name: str
    priority: str
    status: Status
    detail: str
    http_status: int | None = None
    content_type: str | None = None
    bytes: int = 0
    seconds: float | None = None
    checked_at: str | None = None


def load_checks(path: Path = DEFAULT_CHECKS_FILE) -> list[SourceCheck]:
    """Load and validate the check list. Raises RegistryError naming the entry at fault."""
    try:
        entries = yaml.safe_load(path.read_text(encoding="utf-8")) or []
    except FileNotFoundError as exc:
        raise RegistryError(f"{path}: file not found") from exc
    except yaml.YAMLError as exc:
        raise RegistryError(f"{path}: invalid YAML: {exc}") from exc
    checks: list[SourceCheck] = []
    for index, entry in enumerate(entries):
        try:
            checks.append(SourceCheck(**entry))
        except (ValidationError, TypeError) as exc:
            name = (
                entry.get("id", f"entry {index}") if isinstance(entry, dict) else f"entry {index}"
            )
            detail = (
                "; ".join(
                    f"{'.'.join(str(part) for part in err['loc']) or '<entry>'}: {err['msg']}"
                    for err in exc.errors()
                )
                if isinstance(exc, ValidationError)
                else str(exc)
            )
            raise RegistryError(f"{path}: check {name!r}: {detail}") from exc
    duplicates = sorted(key for key, n in Counter(check.id for check in checks).items() if n > 1)
    if duplicates:
        raise RegistryError(f"{path}: duplicate ids: {', '.join(duplicates)}")
    return checks


def evaluate(check: SourceCheck, sample: Sample) -> tuple[Status, str]:
    """Turn a response into a status and a one-line explanation."""
    code = sample.status_code
    if 200 <= code < 300:
        if check.expect is None and check.expect_type is None:
            return "reachable", "answered; content not verified"
        if check.expect_type is not None and check.expect_type not in sample.content_type:
            return "failed", f"content type is {sample.content_type!r}, not {check.expect_type!r}"
        if check.expect is not None:
            text = sample.content.decode(check.encoding, errors="replace")
            if check.expect not in text:
                return "failed", f"{check.expect!r} not found in the first {len(text)} characters"
        return "ok", "expected content found"
    if check.needs_key:
        return "needs_key", f"HTTP {code} without a key (set {check.needs_key})"
    if code in (401, 403, 429, 451):
        return "blocked", f"HTTP {code}"
    return "failed", f"HTTP {code}"


def _interleave(checks: Iterable[SourceCheck]) -> list[SourceCheck]:
    """Order checks so consecutive requests go to different hosts, to overlap the pacing."""
    queues: dict[str, deque[SourceCheck]] = {}
    for check in checks:
        queues.setdefault(httpx.URL(check.url or "").host, deque()).append(check)
    ordered: list[SourceCheck] = []
    while queues:
        for host in list(queues):
            ordered.append(queues[host].popleft())
            if not queues[host]:
                del queues[host]
    return ordered


def run_checks(
    checks: Sequence[SourceCheck],
    sampler: Sampler,
    *,
    keep_sample: Callable[[SourceCheck, Sample], None] | None = None,
    on_result: Callable[[CheckResult], None] | None = None,
    now: Callable[[], datetime] = lambda: datetime.now(UTC),
) -> list[CheckResult]:
    """Run every check once. `keep_sample` is never called for checks marked `pii`."""
    results: list[CheckResult] = []

    def record(check: SourceCheck, status: Status, detail: str, **fields: Any) -> None:
        result = CheckResult(
            id=check.id,
            section=check.section,
            name=check.name,
            priority=check.priority,
            status=status,
            detail=detail,
            checked_at=now().isoformat(timespec="seconds"),
            **fields,
        )
        results.append(result)
        if on_result:
            on_result(result)

    for check in checks:
        if check.skip is not None:
            record(check, "skipped", check.skip)

    for check in _interleave(check for check in checks if check.url is not None):
        assert check.url is not None
        try:
            sample = sampler.fetch(
                check.url,
                method=check.method,
                headers=check.headers,
                json=check.body,
                timeout=check.timeout,
                max_bytes=check.max_bytes,
            )
        except httpx.HTTPError as exc:
            record(check, "unreachable", f"{type(exc).__name__}: {exc}"[:200])
            continue
        status, detail = evaluate(check, sample)
        record(
            check,
            status,
            detail,
            http_status=sample.status_code,
            content_type=sample.content_type or None,
            bytes=len(sample.content),
            seconds=round(sample.seconds, 2),
        )
        if keep_sample and not check.pii and 200 <= sample.status_code < 300:
            keep_sample(check, sample)

    order = {check.id: index for index, check in enumerate(checks)}
    return sorted(results, key=lambda result: order[result.id])


def build_report(
    checks: Sequence[SourceCheck],
    results: Iterable[CheckResult],
    previous: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Merge new results into the previous report, so a partial re-run refines it.

    The report follows the order of `checks` and drops ids that are no longer listed.
    """
    merged: dict[str, dict[str, Any]] = {
        item["id"]: item for item in (previous or {}).get("results", [])
    }
    merged.update({result.id: asdict(result) for result in results})
    ordered = [merged[check.id] for check in checks if check.id in merged]
    counts = Counter(item["status"] for item in ordered)
    return {
        "generated_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "counts": {status: counts.get(status, 0) for status in STATUSES},
        "results": ordered,
    }
