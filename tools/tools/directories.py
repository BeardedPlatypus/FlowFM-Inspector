from dataclasses import dataclass
from pathlib import Path
from typing import Collection, Iterable, Literal

from tools.jinja_environment import env
import tools.persistence as persistence


directory_template_name: Literal["Directories.wxs.jinja"] = "Directories.wxs.jinja"
directory_prefix: Literal["dir::"] = "dir::"


@dataclass
class DirectoryDescription:
    id: str
    name: str
    children: Collection["DirectoryDescription"]


def generate_directories_fragment(base_src_path: Path, write_path: Path):
    directories = _gather_directories(base_src_path)
    content = _render(directories)
    persistence.write(content, write_path)


def _gather_directories(base_src_path: Path) -> Collection[DirectoryDescription]:
    subdirectories = _retrieve_subdirectories(base_src_path)
    return [_gather_directories_recursive(p, "") for p in subdirectories]


def _gather_directories_recursive(path: Path, parent_id: str) -> DirectoryDescription:
    id = f"{parent_id}.{path.name}" if parent_id else f"{directory_prefix}{path.name}"

    subdirectories = _retrieve_subdirectories(path)
    children = [_gather_directories_recursive(p, id) for p in subdirectories]

    return DirectoryDescription(id=id, name=path.name, children=children)


def _retrieve_subdirectories(p: Path) -> Iterable[Path]:
    return (subdir for subdir in p.iterdir() if subdir.is_dir())


def _render(directories: Collection[DirectoryDescription]) -> str:
    template = env.get_template(directory_template_name)
    return template.render(directories=directories)
