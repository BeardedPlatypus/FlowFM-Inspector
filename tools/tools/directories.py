from dataclasses import dataclass
from jinja2 import Environment, PackageLoader, select_autoescape
from pathlib import Path
from typing import Collection, Literal

from tools.jinja_environment import env


directory_template_name: Literal["Directories.wxs.jinja"] = "Directories.wxs.jinja"


@dataclass
class DirectoryDescription:
    id: str
    name: Path
    children: Collection["DirectoryDescription"]


def generate_directories_fragment(base_src_path: Path):
    directories = _gather_directories(base_src_path)


def _gather_directories(base_src_path: Path) -> Collection[DirectoryDescription]:
    # App Directories
    return []

def _render(directories: Collection[DirectoryDescription]) -> str:
    template = env.get_template(directory_template_name)
    return template.render(directories=directories)
