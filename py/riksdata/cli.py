"""The `riksdata` command line interface."""

import typer

app = typer.Typer(help="Riksdata 2.0 data pipeline.", no_args_is_help=True, add_completion=False)


@app.callback()
def main() -> None:
    """Riksdata 2.0 data pipeline."""
