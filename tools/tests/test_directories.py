import inspect
from pathlib import Path
import pytest
import shutil
from typing import Collection, List

from tools.directories import DirectoryDescription, _gather_directories, _render


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


@pytest.mark.parametrize(
    "input, expected_output",
    [
        pytest.param(
            [],
            inspect.cleandoc(
                """
                <?xml version="1.0" encoding="UTF-8"?>
                <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
                    <Fragment>
                        <Directory Id="TARGETDIR" 
                                   Name="SourceDir">
                            <Directory Id="ProgramFiles64Folder">
                                <Directory Id="INSTALLFOLDER" Name="FlowFM-Inspector">
                                </Directory>
                            </Directory>
                        </Directory>
                    </Fragment>
                </Wix>
                """
            ),
        ),
        pytest.param(
            [DirectoryDescription(id="core", name="core", children=[])],
            inspect.cleandoc(
                """
                <?xml version="1.0" encoding="UTF-8"?>
                <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
                    <Fragment>
                        <Directory Id="TARGETDIR" 
                                   Name="SourceDir">
                            <Directory Id="ProgramFiles64Folder">
                                <Directory Id="INSTALLFOLDER" Name="FlowFM-Inspector">
                                    <Directory Id="core"
                                               Name="core"/> 
                                </Directory>
                            </Directory>
                        </Directory>
                    </Fragment>
                </Wix>
                """
            ),
        ),
        pytest.param(
            [
                DirectoryDescription(id="core", name="core", children=[]),
                DirectoryDescription(id="ui", name="ui", children=[]),
            ],
            inspect.cleandoc(
                """
                <?xml version="1.0" encoding="UTF-8"?>
                <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
                    <Fragment>
                        <Directory Id="TARGETDIR" 
                                   Name="SourceDir">
                            <Directory Id="ProgramFiles64Folder">
                                <Directory Id="INSTALLFOLDER" Name="FlowFM-Inspector">
                                    <Directory Id="core"
                                               Name="core"/> 
                                    <Directory Id="ui"
                                               Name="ui"/> 
                                </Directory>
                            </Directory>
                        </Directory>
                    </Fragment>
                </Wix>
                """
            ),
        ),
        pytest.param(
            [
                DirectoryDescription(
                    id="core",
                    name="core",
                    children=[
                        DirectoryDescription(id="core.sub1", name="sub1", children=[]),
                        DirectoryDescription(id="core.sub2", name="sub2", children=[]),
                    ],
                ),
                DirectoryDescription(id="ui", name="ui", children=[]),
            ],
            inspect.cleandoc(
                """
                <?xml version="1.0" encoding="UTF-8"?>
                <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
                    <Fragment>
                        <Directory Id="TARGETDIR" 
                                   Name="SourceDir">
                            <Directory Id="ProgramFiles64Folder">
                                <Directory Id="INSTALLFOLDER" Name="FlowFM-Inspector">
                                    <Directory Id="core"
                                               Name="core"> 
                                        <Directory Id="core.sub1"
                                                   Name="sub1"/> 
                                        <Directory Id="core.sub2"
                                                   Name="sub2"/> 
                                    </Directory>
                                    <Directory Id="ui"
                                               Name="ui"/> 
                                </Directory>
                            </Directory>
                        </Directory>
                    </Fragment>
                </Wix>
                """
            ),
        ),
    ],
)
def test_render(input: Collection[DirectoryDescription], expected_output: str):
    result = _render(input)
    assert result == expected_output
