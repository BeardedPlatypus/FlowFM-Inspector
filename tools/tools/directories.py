from dataclasses import dataclass
from pathlib import Path
from typing import Collection


@dataclass
class DirectoryDescription:
    id: str
    name: Path
    children: Collection["DirectoryDescription"]


def gather_directories(self, base_src_path: Path) -> Collection[DirectoryDescription]:
    # App Directories


    return []
