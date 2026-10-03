"""The adapter table: every registry source has an adapter, and unknown sources are refused."""

import httpx
import pytest

from riksdata.adapters import ADAPTERS, build_adapter
from riksdata.http import HttpClient
from riksdata.registry import Source, load_registry
from support import REPO_ROOT, make_source


def offline_client(source: Source) -> HttpClient:
    return HttpClient(source, transport=httpx.MockTransport(lambda request: httpx.Response(500)))


def test_every_registry_source_has_an_adapter() -> None:
    registry = load_registry(REPO_ROOT / "registry")

    assert sorted(registry.sources) == sorted(ADAPTERS)
    for source in registry.sources.values():
        client = offline_client(source)
        assert build_adapter(source, client).source_id == source.source_id
        client.close()


def test_a_source_without_an_adapter_is_refused() -> None:
    source = make_source()
    client = offline_client(source)

    with pytest.raises(ValueError, match="no adapter for source 'demo'"):
        build_adapter(source, client)

    client.close()
