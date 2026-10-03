"""Source adapters. Each one turns a publisher's API into series and observations."""

from __future__ import annotations

from collections.abc import Callable

from riksdata.adapters.base import Adapter
from riksdata.adapters.owid import OwidAdapter
from riksdata.adapters.ssb import SsbAdapter
from riksdata.http import HttpClient
from riksdata.registry import Source

# source id -> adapter class. A source needs an entry here and in registry/sources.yaml.
ADAPTERS: dict[str, Callable[[Source, HttpClient], Adapter]] = {
    "owid": OwidAdapter,
    "ssb": SsbAdapter,
}


def build_adapter(source: Source, client: HttpClient) -> Adapter:
    try:
        factory = ADAPTERS[source.source_id]
    except KeyError:
        raise ValueError(f"no adapter for source {source.source_id!r}") from None
    return factory(source, client)
