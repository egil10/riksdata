"""The shared Batch schema check."""

import polars as pl
import pytest

from riksdata.adapters.base import (
    OBSERVATIONS_SCHEMA,
    SERIES_SCHEMA,
    Batch,
    BatchSchemaError,
    check_batch,
)
from support import make_batch


def test_valid_batch_passes() -> None:
    batch = make_batch("demo.ds.a", "demo.ds.b")

    check_batch(batch)

    assert batch.series.height == 2
    assert batch.observations.height == 4


def test_empty_frames_with_the_right_schema_pass() -> None:
    check_batch(
        Batch(
            series=pl.DataFrame(schema=SERIES_SCHEMA),
            observations=pl.DataFrame(schema=OBSERVATIONS_SCHEMA),
        )
    )


def test_wrong_dtype_is_reported() -> None:
    batch = make_batch()
    wrong = Batch(batch.series, batch.observations.with_columns(pl.col("value").cast(pl.Int64)))

    with pytest.raises(BatchSchemaError, match="observations: column 'value' is Int64"):
        check_batch(wrong)


def test_naive_timestamp_is_reported() -> None:
    batch = make_batch()
    naive = batch.series.with_columns(pl.col("retrieved_at").dt.replace_time_zone(None))

    with pytest.raises(BatchSchemaError, match="series: column 'retrieved_at' is Datetime"):
        check_batch(Batch(naive, batch.observations))


def test_missing_and_unexpected_columns_are_reported() -> None:
    batch = make_batch()
    renamed = batch.series.rename({"unit": "units"})

    with pytest.raises(BatchSchemaError) as excinfo:
        check_batch(Batch(renamed, batch.observations))

    assert "series: missing column 'unit'" in str(excinfo.value)
    assert "series: unexpected column 'units'" in str(excinfo.value)


def test_column_order_is_checked() -> None:
    batch = make_batch()
    shuffled = batch.observations.select(reversed(batch.observations.columns))

    with pytest.raises(BatchSchemaError, match="observations: columns are out of order"):
        check_batch(Batch(batch.series, shuffled))
