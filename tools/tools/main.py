import typer

from pathlib import Path
from typing import List, Literal, Optional

import tools.directories as directories
import tools.components as components


app = typer.Typer()


@app.command()
def generate_directories_fragment(
    base_src_folder: Path = typer.Argument(
        ..., help="The source folder in which all binaries are located"
    ),
    target_directory: Path = typer.Option(
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


# Literals not yet supported
Component = Literal["app", "core", "ui"]


@app.command()
def generate_component_fragment(
    base_src_folder: Path = typer.Argument(
        ..., help="The source folder in which all binaries are located."
    ),
    component: str = typer.Argument(
        ..., help="The component type for which to create the fragment."
    ),
    included_paths: Optional[List[Path]] = typer.Option(
        None,
        help="The relative paths to include in the fragment. Note that these will always be evaluated, even if part of the ignored_paths.",
    ),
    excluded_paths: Optional[List[Path]] = typer.Option(
        None, help="Relative paths which are excluded from the fragment."
    ),
    target_directory: Path = typer.Option(
        Path.cwd(),
        help="The target directory to which the `<component>.wxs` is written",
    ),
    additional_component_groups_refs: Optional[List[str]] = typer.Option(
        None, help="Any additional component groups references to add to the fragment."
    ),
):
    """
    Generate the `<component>.wxs` fragment.

    The `<component>.wxs` fragment is generated in the target_directory. If no
    target_directory is specified it will be generated in the current working
    directory.
    """
    if included_paths is None:
        included_paths = [Path(".")]
    if additional_component_groups_refs is None:
        additional_component_groups_refs = []
    if excluded_paths is None:
        excluded_paths = []

    ignored_paths_set = {base_src_folder / p for p in excluded_paths}
    component_groups_refs = [
        components.ComponentGroupRef(id) for id in additional_component_groups_refs
    ]
    write_path = target_directory / f"{component}.wxs"

    fragment_configuration = components.FragmentGenerationConfiguration(
        base_src_path=base_src_folder,
        write_path=write_path,
        component_group_prefix=component,
        included_paths=included_paths,
        ignored_paths=ignored_paths_set,
        additional_component_group_refs=component_groups_refs,
    )
    components.generate_components_fragment(fragment_configuration)


if __name__ == "__main__":
    app()
