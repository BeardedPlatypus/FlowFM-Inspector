from dataclasses import dataclass
from typing import Collection, Literal, Protocol

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


def _render(component_groups: Collection[ComponentGroup]) -> str:
    template = env.get_template(component_template_name)
    return template.render(component_groups=component_groups)
