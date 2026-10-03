"""The source check: sampling, classification, the check list and the CLI command."""

from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx
import pytest
from typer.testing import CliRunner

from riksdata import cli, sourcecheck, storage
from riksdata.http import Sample, Sampler
from riksdata.registry import RegistryError
from riksdata.sourcecheck import SourceCheck, build_report, evaluate, load_checks, run_checks
from support import REPO_ROOT, FakeClock

Handler = Callable[[httpx.Request], httpx.Response]
NOW = datetime(2026, 10, 3, 12, 0, tzinfo=UTC)


def make_sampler(handler: Handler, clock: FakeClock | None = None) -> Sampler:
    clock = clock or FakeClock()
    return Sampler(transport=httpx.MockTransport(handler), clock=clock, sleep=clock.sleep)


def make_check(**fields: Any) -> SourceCheck:
    base = {"id": "demo", "section": "1a", "priority": "A", "access": "api", "name": "Demo source"}
    if "skip" not in fields:
        base["url"] = "https://example.org/api"
    return SourceCheck(**{**base, **fields})


def sample(
    status: int = 200,
    body: bytes = b"",
    content_type: str = "application/json",
    url: str = "https://example.org/api",
) -> Sample:
    return Sample(status, content_type, body, False, url, 0.1)


# --- Sampler -------------------------------------------------------------------------------


def test_sampler_stops_reading_at_max_bytes() -> None:
    sent = []

    def body() -> Any:
        for _ in range(1000):
            sent.append(1)
            yield b"x" * 1024

    sampler = make_sampler(lambda request: httpx.Response(200, content=body()))

    result = sampler.fetch("https://example.org/big.zip", max_bytes=4096)

    assert len(result.content) == 4096
    assert result.truncated is True
    assert len(sent) < 1000  # the megabyte was never pulled through


def test_sampler_returns_small_bodies_whole() -> None:
    sampler = make_sampler(
        lambda request: httpx.Response(200, json={"ok": True}, headers={"x-test": "1"})
    )

    result = sampler.fetch("https://example.org/api")

    assert result.content == b'{"ok":true}'
    assert (result.status_code, result.truncated) == (200, False)
    assert result.content_type == "application/json"


def test_sampler_reports_the_size_and_date_the_server_states() -> None:
    headers = {"Content-Length": "5000000", "Last-Modified": "Fri, 17 Mar 2023 16:10:21 GMT"}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/packed":
            return httpx.Response(200, content=b"", headers={"Content-Encoding": "gzip", **headers})
        if request.url.path == "/file.zip":
            return httpx.Response(200, content=(b"x" * 1024 for _ in range(100)), headers=headers)
        return httpx.Response(200, content=(b"x" for _ in range(3)))  # chunked: no length given

    sampler = make_sampler(handler)

    whole = sampler.fetch("https://example.org/file.zip", max_bytes=2048)
    assert (len(whole.content), whole.total_bytes) == (2048, 5_000_000)
    assert whole.last_modified == "Fri, 17 Mar 2023 16:10:21 GMT"
    # A compressed transfer's length is not the size of what we read, so it is left out.
    assert sampler.fetch("https://example.org/packed").total_bytes is None
    unsized = sampler.fetch("https://example.org/stream")
    assert (unsized.total_bytes, unsized.last_modified) == (None, None)


def test_sampler_never_retries_and_reports_the_status() -> None:
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(503)

    result = make_sampler(handler).fetch("https://example.org/api")

    assert result.status_code == 503
    assert len(seen) == 1


def test_sampler_paces_each_host_separately() -> None:
    clock = FakeClock()
    sampler = make_sampler(lambda request: httpx.Response(200), clock)

    sampler.fetch("https://a.example.org/1")
    sampler.fetch("https://b.example.org/1")
    assert clock.sleeps == []

    sampler.fetch("https://a.example.org/2")
    assert clock.sleeps == [2.0]


def test_sampler_sends_user_agent_headers_and_json_body() -> None:
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(200)

    make_sampler(handler).fetch(
        "https://example.org/search", method="POST", headers={"X-Client": "riksdata"}, json=[]
    )

    (request,) = seen
    assert request.method == "POST"
    assert request.headers["User-Agent"].startswith("riksdata/")
    assert request.headers["X-Client"] == "riksdata"
    assert request.content == b"[]"


# --- evaluate ------------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("check", "response", "status", "detail"),
    [
        ({"expect": '"id"'}, sample(200, b'{"id": 1}'), "ok", "expected content found"),
        ({}, sample(200, b"<html>"), "reachable", "content not verified"),
        ({"expect": "PK"}, sample(200, b"<html>"), "failed", "'PK' not found"),
        ({"expect_type": "csv"}, sample(200, b"a;b", "text/csv"), "ok", "expected content"),
        ({"expect_type": "json"}, sample(200, b"<html>", "text/html"), "failed", "content type is"),
        ({"needs_key": "DEMO_KEY"}, sample(401), "needs_key", "set DEMO_KEY"),
        ({"needs_key": "DEMO_KEY"}, sample(502), "needs_key", "HTTP 502 without a key"),
        ({"needs_key": "DEMO_KEY"}, sample(200), "reachable", "content not verified"),
        ({}, sample(403), "blocked", "HTTP 403"),
        ({}, sample(429), "blocked", "HTTP 429"),
        ({}, sample(404), "failed", "HTTP 404"),
        # A soft 404: the host answers 200, but only after sending us to its not-found page.
        (
            {"expect_type": "html"},
            sample(200, b"<html>", "text/html", "https://example.org/web/page-404"),
            "failed",
            "redirected to a not-found page",
        ),
        # No redirect, so a 404 in the address we asked for means nothing.
        (
            {"url": "https://example.org/tables/14404"},
            sample(200, b"{}", url="https://example.org/tables/14404"),
            "reachable",
            "content not verified",
        ),
        ({}, sample(500), "failed", "HTTP 500"),
        (
            {"expect": "Navn", "encoding": "utf-16"},
            sample(200, "Navn;Land".encode("utf-16")),
            "ok",
            "expected content found",
        ),
    ],
)
def test_evaluate(check: dict[str, Any], response: Sample, status: str, detail: str) -> None:
    result_status, result_detail = evaluate(make_check(**check), response)

    assert result_status == status
    assert detail in result_detail


# --- run_checks ----------------------------------------------------------------------------


def test_run_checks_classifies_and_keeps_the_registry_order() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path == "/down":
            raise httpx.ConnectError("connection refused")
        codes = {"/ok": 200, "/page": 200, "/key": 401, "/blocked": 403, "/gone": 404}
        return httpx.Response(codes[path], text='{"rows": []}', headers={"Last-Modified": "today"})

    checks = [
        make_check(id="never", skip="Never use"),
        make_check(id="gone", url="https://a.example.org/gone"),
        make_check(id="ok", url="https://a.example.org/ok", expect="rows"),
        make_check(id="page", url="https://b.example.org/page"),
        make_check(id="key", url="https://c.example.org/key", needs_key="DEMO_KEY"),
        make_check(id="blocked", url="https://d.example.org/blocked"),
        make_check(id="down", url="https://e.example.org/down"),
    ]

    results = run_checks(checks, make_sampler(handler), now=lambda: NOW)

    assert [(result.id, result.status) for result in results] == [
        ("never", "skipped"),
        ("gone", "failed"),
        ("ok", "ok"),
        ("page", "reachable"),
        ("key", "needs_key"),
        ("blocked", "blocked"),
        ("down", "unreachable"),
    ]
    ok = results[2]
    assert (ok.http_status, ok.content_type, ok.bytes) == (200, "text/plain; charset=utf-8", 12)
    assert ok.checked_at == "2026-10-03T12:00:00+00:00"
    assert (ok.total_bytes, ok.last_modified) == (12, "today")
    assert results[0].detail == "Never use"
    assert results[6].detail.startswith("ConnectError: connection refused")
    assert results[6].http_status is None


def test_run_checks_keeps_no_sample_for_pii_or_failed_requests() -> None:
    kept: list[str] = []
    checks = [
        make_check(id="open", url="https://a.example.org/x"),
        make_check(id="people", url="https://b.example.org/x", pii=True),
        make_check(id="broken", url="https://c.example.org/404"),
    ]

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(404 if request.url.path == "/404" else 200, text="data")

    run_checks(
        checks,
        make_sampler(handler),
        keep_sample=lambda check, response: kept.append(check.id),
    )

    assert kept == ["open"]


def test_run_checks_interleaves_hosts() -> None:
    order: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        order.append(f"{request.url.host}{request.url.path}")
        return httpx.Response(200)

    checks = [
        make_check(id="a1", url="https://a.example.org/1"),
        make_check(id="a2", url="https://a.example.org/2"),
        make_check(id="a3", url="https://a.example.org/3"),
        make_check(id="b1", url="https://b.example.org/1"),
    ]
    clock = FakeClock()

    run_checks(checks, make_sampler(handler, clock))

    assert order == ["a.example.org/1", "b.example.org/1", "a.example.org/2", "a.example.org/3"]
    assert clock.sleeps == [2.0, 2.0]


def test_run_checks_stops_asking_a_host_that_answers_429() -> None:
    seen: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(f"{request.url.host}{request.url.path}")
        return httpx.Response(429 if request.url.host == "a.example.org" else 200)

    checks = [
        make_check(id="a1", url="https://a.example.org/1"),
        make_check(id="a2", url="https://a.example.org/2"),
        make_check(id="b1", url="https://b.example.org/1"),
        make_check(id="a3", url="https://a.example.org/3", needs_key="DEMO_KEY"),
    ]

    results = run_checks(checks, make_sampler(handler))

    # The rate-limited host got one request, not three.
    assert seen == ["a.example.org/1", "b.example.org/1"]
    assert [(result.id, result.status) for result in results] == [
        ("a1", "blocked"),
        ("a2", "blocked"),
        ("b1", "reachable"),
        ("a3", "blocked"),
    ]
    assert results[0].detail == "HTTP 429"
    assert results[1].detail == "not requested: a.example.org answered 429 earlier in this run"
    assert results[1].http_status is None


# --- the check list and the report ---------------------------------------------------------


def write_checks(path: Path, body: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding="utf-8")
    return path


def test_load_checks_reports_the_entry_at_fault(tmp_path: Path) -> None:
    entry = '- {id: demo, section: "1a", priority: A, access: api, name: "Demo"'
    cases = {
        "neither": (entry + "}\n", "check 'demo': <entry>: Value error, give exactly one"),
        "both": (entry + ', url: "https://x.org", skip: "no"}\n', "give exactly one of"),
        "typo": (entry + ', url: "https://x.org", expcet: "x"}\n', "expcet: Extra inputs"),
        "bad-id": (entry.replace("demo", "Demo_1") + ', url: "https://x.org"}\n', "id: String"),
        "no-access": (
            entry.replace(" access: api,", "") + ', url: "https://x.org"}\n',
            "access: Field",
        ),
        "bad-access": (entry.replace("api", "ftp") + ', url: "https://x.org"}\n', "access: Input"),
        "duplicate": ((entry + ', url: "https://x.org"}\n') * 2, "duplicate ids: demo"),
    }
    for name, (body, message) in cases.items():
        with pytest.raises(RegistryError, match=message):
            load_checks(write_checks(tmp_path / f"{name}.yaml", body))

    with pytest.raises(RegistryError, match="file not found"):
        load_checks(tmp_path / "missing.yaml")


def test_repo_check_list_covers_every_catalogue_row() -> None:
    checks = load_checks(REPO_ROOT / "registry" / "source_checks.yaml")

    candidates = [check for check in checks if check.section == "23"]
    assert len(checks) - len(candidates) == 311  # the catalogue rows in SOURCES.md sections 1-20
    assert len(candidates) == 7  # the rows of section 23, found by the source inventory
    assert all(check.url.startswith("https://") for check in checks if check.url)
    never_use = [check for check in checks if check.priority == "-"]
    assert never_use
    assert all(check.skip and check.access == "none" for check in never_use)
    # A row that isn't requested has no source of its own, is used by hand, or is a publication.
    assert all(check.access in ("none", "manual", "docs") for check in checks if check.skip)
    # Sources with person-level data are flagged, so no sample of them is ever kept.
    flagged = {check.id for check in checks if check.pii}
    assert {
        "fiskeridir-fartoyregister",
        "landbruksdir-tilskudd",
        "valg-lister-kandidater",
    } <= flagged


def test_build_report_merges_a_partial_rerun() -> None:
    checks = [make_check(id="a"), make_check(id="b", access="page")]
    first = [
        sourcecheck.CheckResult("a", "1a", "A", "A", "failed", "HTTP 404"),
        sourcecheck.CheckResult("b", "1a", "B", "A", "ok", "fine"),
        sourcecheck.CheckResult("removed", "1a", "Gone", "A", "ok", "fine"),
    ]
    previous = build_report([*checks, make_check(id="removed")], first)

    rerun = [sourcecheck.CheckResult("a", "1a", "A", "A", "ok", "fixed")]
    report = build_report(checks, rerun, previous)

    assert [(item["id"], item["status"]) for item in report["results"]] == [
        ("a", "ok"),
        ("b", "ok"),
    ]
    assert report["counts"]["ok"] == 2
    assert report["counts"]["failed"] == 0
    assert set(report["counts"]) == set(sourcecheck.STATUSES)
    # The access class comes from the check list, also for results kept from the last run.
    assert [item["access"] for item in report["results"]] == ["api", "page"]
    assert set(report["access"]) == set(sourcecheck.ACCESS)
    assert (report["access"]["api"]["ok"], report["access"]["page"]["ok"]) == (1, 1)
    assert sum(sum(row.values()) for row in report["access"].values()) == 2


# --- CLI -----------------------------------------------------------------------------------


def test_cli_check_sources(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    write_checks(
        tmp_path / "registry" / "source_checks.yaml",
        '- {id: open, section: "1a", priority: A, access: api, name: "Open", '
        'url: "https://a.example.org/x", expect: "rows"}\n'
        '- {id: people, section: "15", priority: A, access: file, name: "People", pii: true, '
        'url: "https://b.example.org/x"}\n'
        '- {id: never, section: "2", priority: "-", access: none, name: "Never", '
        'skip: "Never use"}\n',
    )
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(
        cli,
        "Sampler",
        lambda: make_sampler(lambda request: httpx.Response(200, json={"rows": []})),
    )
    runner = CliRunner()

    everything = runner.invoke(cli.app, ["check-sources"])
    one = runner.invoke(cli.app, ["check-sources", "--only", "open"])
    none = runner.invoke(cli.app, ["check-sources", "--status", "failed"])

    assert everything.exit_code == 0, everything.output
    assert "Checked 3 now" in everything.output
    # The second table: one row per access class, one column per status that occurs.
    lines = [line.split() for line in everything.output.splitlines()]
    assert ["access", "sources", "ok", "reachable", "skipped"] in lines
    assert ["api", "1", "1", "0", "0"] in lines
    assert ["none", "1", "0", "0", "1"] in lines
    report = storage.read_source_checks(Path("lake"))
    assert report is not None
    assert report["counts"] == {
        "ok": 1,
        "reachable": 1,
        "needs_key": 0,
        "blocked": 0,
        "unreachable": 0,
        "failed": 0,
        "skipped": 1,
    }
    samples = sorted(path.name for path in Path("lake/source_checks/samples").iterdir())
    assert samples == ["open.json"]  # nothing is kept for the person-level source
    assert "Checked 1 now" in one.output
    assert len(storage.read_source_checks(Path("lake"))["results"]) == 3
    assert none.exit_code == 1
    assert "No checks match" in none.output
