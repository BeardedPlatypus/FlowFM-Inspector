from dataclasses import dataclass
from pathlib import Path
from typing import (
    Collection,
    Iterable,
    List,
    Literal,
    Optional,
    Protocol,
    Sequence,
    Set,
    Union,
)

from tools.directories import directory_prefix
from tools.jinja_environment import env
import tools.persistence as persistence


ComponentType = Literal["component", "component_group_ref"]
component_template_name: Literal["Component.wxs.jinja"] = "Component.wxs.jinja"


class ComponentGroupElement(Protocol):
    @property
    def component_type(self) -> ComponentType:
        raise NotImplemented


@dataclass
class ComponentElement:
    name: str
    source: str

    @property
    def component_type(self) -> ComponentType:
        return "component"


@dataclass
class ComponentGroupRef:
    id: str

    @property
    def component_type(self) -> ComponentType:
        return "component_group_ref"


@dataclass
class ComponentGroup:
    id: str
    dir: str

    children: Collection[ComponentGroupElement]


@dataclass
class FragmentGenerationConfiguration:
    base_src_path: Path
    write_path: Path
    component_group_prefix: str
    ignored_paths: Set[Path]
    additional_component_group_refs: Sequence[ComponentGroupRef]
    is_root: bool


def generate_components_fragment(config: FragmentGenerationConfiguration):
    component_groups = _gather_component_groups(config)
    content = _render(component_groups)
    persistence.write(content, config.write_path)


def _gather_component_groups(
    config: FragmentGenerationConfiguration,
) -> Collection[ComponentGroup]:
    # Each folder corresponds with a separate component group.
    # The root component group
    return []


def _gather_component_groups_recursive(
    path: Path, parent_id: str, config: FragmentGenerationConfiguration
) -> Collection[ComponentGroup]:
    # Note that the ids of the component groups correspond with the folder and only differ in prefix
    id = f"{parent_id}.{path.name}"

    directory_id = f"{directory_prefix}{id}"
    component_group_id = f"{config.component_group_prefix}{id}"

    child_components = _gather_components(path, config)

    child_component_groups: List[ComponentGroup] = [
        component_group
        for p in _get_directories(path, config)
        for component_group in _gather_component_groups_recursive(p, id, config)
    ]

    child_component_group_references = [
        ComponentGroupRef(id=cg.id) for cg in child_component_groups
    ]

    children = child_components + child_component_group_references  # type: ignore

    component_group = ComponentGroup(
        id=component_group_id, dir=directory_id, children=children
    )

    return [component_group] + child_component_groups


def _gather_components(
    path: Path, config: FragmentGenerationConfiguration
) -> List[ComponentGroupElement]:
    return [_element_from_path(p) for p in _get_filepaths(path, config)]


def _element_from_path(path: Path) -> ComponentElement:
    return ComponentElement(name=path.name, source=str(path))


def _get_filepaths(
    path: Path, config: FragmentGenerationConfiguration
) -> Iterable[Path]:
    return (
        p
        for p in path.glob("*")
        if p.is_file() and p.absolute() not in config.ignored_paths
    )


def _get_directories(
    path: Path, config: FragmentGenerationConfiguration
) -> Iterable[Path]:
    return (
        p
        for p in path.glob("*")
        if p.is_dir() and p.absolute() not in config.ignored_paths
    )


def _render(component_groups: Collection[ComponentGroup]) -> str:
    template = env.get_template(component_template_name)
    return template.render(component_groups=component_groups)
