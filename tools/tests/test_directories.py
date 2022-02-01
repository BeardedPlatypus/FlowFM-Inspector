from pathlib import Path
import shutil
from typing import List

from tools.directories import DirectoryDescription, _gather_directories


def test_gather_directories(tmpdir):
    basepath = Path(tmpdir.mkdir(test_gather_directories.__name__))
    _construct_test_directory_hierarchy(basepath)

    result = _gather_directories(basepath)

    expected_values = _gather_directories_expected_values()
    assert result == expected_values


def _construct_test_directory_hierarchy(basepath: Path):
    shutil.rmtree(basepath)

    for i in range(5):
        p = basepath / "core" / f"sub_{i}"
        p.mkdir(parents=True)

    for i in range(5):
        p = basepath / "ui" / "sub" / f"sub_{i}"
        p.mkdir(parents=True)


def _gather_directories_expected_values() -> List[DirectoryDescription]:
    return [
        DirectoryDescription(
            id="core",
            name="core",
            children=[
                DirectoryDescription(id="core.sub_0", name="sub_0", children=[]),
                DirectoryDescription(id="core.sub_1", name="sub_1", children=[]),
                DirectoryDescription(id="core.sub_2", name="sub_2", children=[]),
                DirectoryDescription(id="core.sub_3", name="sub_3", children=[]),
                DirectoryDescription(id="core.sub_4", name="sub_4", children=[]),
            ],
        ),
        DirectoryDescription(
            id="ui",
            name="ui",
            children=[
                DirectoryDescription(
                    id="ui.sub",
                    name="sub",
                    children=[
                        DirectoryDescription(
                            id="ui.sub.sub_0", name="sub_0", children=[]
                        ),
                        DirectoryDescription(
                            id="ui.sub.sub_1", name="sub_1", children=[]
                        ),
                        DirectoryDescription(
                            id="ui.sub.sub_2", name="sub_2", children=[]
                        ),
                        DirectoryDescription(
                            id="ui.sub.sub_3", name="sub_3", children=[]
                        ),
                        DirectoryDescription(
                            id="ui.sub.sub_4", name="sub_4", children=[]
                        ),
                    ],
                ),
            ],
        ),
    ]
