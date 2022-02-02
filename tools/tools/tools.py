import typer

from pathlib import Path
from typing import Literal

import tools.directories as directories


app = typer.Typer()


@app.command()
def generate_directories_fragment(
    base_src_folder: Path = typer.Argument(
        ..., help="The source folder in which all binaries are located"
    ),
    target_directory: Path = typer.Argument(
        Path.cwd(), help="The target directory to which the `Directory.wxs` is written"
    ),
):
    """
    Generate the `Directories.wxs` fragment.

    The `Directories.wxs` fragment is generated in the `target_directory`. If no
    target_directory is specified it will be generated in the current working
    directory.
    """
    target_file_path = target_directory / "Directories.wxs"
    directories.generate_directories_fragment(base_src_folder, target_file_path)


Component = Literal["app", "core", "ui"]


@app.command()
def generate_component_fragment(
    base_src_folder: Path = typer.Argument(
        ..., help="The source folder in which all binaries are located"
    ),
    component: Component = typer.Argument(
        ..., help="The component type for which to create the fragment."
    ),
    target_directory: Path = typer.Argument(
        Path.cwd(), help="The target directory to which the `Directory.wxs` is written"
    ),
):
    """
    Generate the `<component>.wxs` fragment file.

    The `<component>.wxs` fragment is generated in the target_directory. If no
    target_directory is specified it will be generated in the current working
    directory.
    """
    pass


if __name__ == "__main__":
    app()
