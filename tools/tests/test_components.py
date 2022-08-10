import inspect
from pathlib import Path
import pytest
import shutil
from typing import Collection, List

from tools.components import (
    ComponentGroup,
    ComponentGroupElement,
    ComponentElement,
    ComponentGroupRef,
    _gather_component_groups_recursive,
    _render,
)


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
                    </Fragment>
                </Wix>'
                """
            ),
            [ComponentGroup(id="Core", dir="Folder.Core", children=[])],
            inspect.cleandoc(
                """
                <?xml version="1.0" encoding="UTF-8"?>
                <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
                    <Fragment>
                        <ComponentGroup Id="Core" Directory="Folder.Core">
                        </ComponentGroup>
                    </Fragment>
                </Wix>'
                """
            ),
        ),
    ],
)
def test_render(input: Collection[ComponentGroup], expected_output: str):
    result = _render(input)
    assert result == expected_output


def test_gather_component_groups_recursive():
    
