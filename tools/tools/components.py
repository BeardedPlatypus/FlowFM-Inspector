from dataclasses import dataclass
from pathlib import Path
from typing import (
    Collection,
    Iterable,
    List,
    Literal,
    Optional,
    Protocol,
    Set,
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
    dir: Optional[str]

    children: List[ComponentGroupElement]


@dataclass
class FragmentGenerationConfiguration:
    base_src_path: Path
    write_path: Path
    component_group_prefix: str
    included_paths: Iterable[Path]
    ignored_paths: Set[Path]
    additional_component_group_refs: List[ComponentGroupRef]


def generate_components_fragment(config: FragmentGenerationConfiguration):
    component_groups = _gather_component_groups(config)
    content = _render(component_groups)
    persistence.write(content, config.write_path)


def _gather_component_groups(
    config: FragmentGenerationConfiguration,
) -> Collection[ComponentGroup]:
    results = [
        _gather_component_groups_recursive(path, "", config)
        for p in config.included_paths
        if (path := config.base_src_path / p).exists() and path.is_dir()
    ]

    if (n_results := len(results)) == 0:
        return []
    elif n_results == 1:
        res = results[0]
        res.next_node.children += config.additional_component_group_refs

        return [res.next_node] + res.deeper_nodes
    else:
        references = [ComponentGroupRef(id=cg.next_node.id) for cg in results]
        references += config.additional_component_group_refs

        children = references + config.additional_component_group_refs

        top_group = ComponentGroup(
            id=f"{config.component_group_prefix}-groups", dir=None, children=children
        )

        nodes = [cg for gr in results for cg in [gr.next_node] + gr.deeper_nodes]

        return [top_group] + nodes


@dataclass
class GatherResult:
    next_node: ComponentGroup
    deeper_nodes: List[ComponentGroup]


def _gather_component_groups_recursive(
    path: Path, parent_id: str, config: FragmentGenerationConfiguration
) -> GatherResult:
    # Note that the ids of the component groups correspond with the folder and only
    # differ in prefix
    if path == config.base_src_path:
        # We set the id separately in the directory and component_group ids
        id = ""
    elif parent_id == "":
        id = path.name
    else:
        id = f"{parent_id}.{path.name}"

    directory_id = (
        f"{directory_prefix}{id}" if path != config.base_src_path else "INSTALLFOLDER"
    )

    group_id_postfix = id if id != "" else "root"
    component_group_id = f"{config.component_group_prefix}::{group_id_postfix}"

    child_components = _gather_components(path, config)

    child_component_groups: List[GatherResult] = [
        _gather_component_groups_recursive(p, id, config)
        for p in _get_directories(path, config)
    ]

    child_component_group_references = [
        ComponentGroupRef(id=cg.next_node.id) for cg in child_component_groups
    ]

    children = child_components + child_component_group_references  # type: ignore

    component_group = ComponentGroup(
        id=component_group_id, dir=directory_id, children=children
    )

    deeper_nodes = [
        cg for gr in child_component_groups for cg in [gr.next_node] + gr.deeper_nodes
    ]

    return GatherResult(next_node=component_group, deeper_nodes=deeper_nodes)


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
        p.relative_to(config.base_src_path)
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
