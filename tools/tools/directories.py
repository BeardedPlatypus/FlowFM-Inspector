from dataclasses import dataclass
from pathlib import Path
from typing import Collection, Iterable, Literal, List, Set

from tools.common import clean_id
from tools.jinja_environment import env
import tools.persistence as persistence


directory_template_name: Literal["Directories.wxs.jinja"] = "Directories.wxs.jinja"
directory_prefix: Literal[""] = ""


@dataclass
class DirectoriesGenerationConfiguration:
    base_src_path: Path
    write_path: Path
    excluded_paths: Set[Path]


@dataclass
class DirectoryDescription:
    id: str
    name: str
    children: Collection["DirectoryDescription"]


def generate_directories_fragment(config: DirectoriesGenerationConfiguration):
    directories = _gather_directories(config)
    content = _render(directories)
    persistence.write(content, config.write_path)


def _gather_directories(
    config: DirectoriesGenerationConfiguration,
) -> Collection[DirectoryDescription]:
    subdirectories = _retrieve_subdirectories(config.base_src_path, config)
    return [_gather_directories_recursive(p, "", config) for p in subdirectories]


def _gather_directories_recursive(
    path: Path, parent_id: str, config: DirectoriesGenerationConfiguration
) -> DirectoryDescription:
    name = clean_id(path.name)
    id = f"{parent_id}.{name}" if parent_id else f"{directory_prefix}{name}"

    subdirectories = _retrieve_subdirectories(path, config)
    children = [_gather_directories_recursive(p, id, config) for p in subdirectories]

    return DirectoryDescription(id=id, name=path.name, children=children)


def _retrieve_subdirectories(
    p: Path, config: DirectoriesGenerationConfiguration
) -> Iterable[Path]:
    return (
        subdir
        for subdir in p.iterdir()
        if subdir.is_dir() and not subdir in config.excluded_paths
    )


def _render(directories: Collection[DirectoryDescription]) -> str:
    template = env.get_template(directory_template_name)
    return template.render(directories=directories)
