from enum import Enum
from pathlib import Path
from typing import Dict, Iterable, List, Literal, Type, Union
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from hydrolib.core.basemodel import FileModel
from hydrolib.core.io.mdu.models import (
    ExternalForcing,
    FMModel,
    General,
    Geometry,
    Hydrology,
    Numerics,
    Output,
    Physics,
    Restart,
    Sediment,
    Time,
    Trachytopes,
    VolumeTables,
    Waves,
)
from hydrolib.core.io.net.models import NetworkModel
from pydantic import BaseModel as PydanticBaseModel
from pydantic.types import UUID4


# The network is currently problematic and we do not want to load it.
NetworkModel.__fields__.pop("network", None)

app = FastAPI()


# origins = ["http://localhost:8002", "localhost:8002"]
origins = ["*"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


mdu_models = [
    General,
    Geometry,
    VolumeTables,
    Numerics,
    Physics,
    Sediment,
    Waves,
    Time,
    Restart,
    ExternalForcing,
    Hydrology,
    Trachytopes,
    Output,
]


schema_mapping: Dict[str, Dict[str, Type]] = {
    "mdu": {m.__name__.lower(): m for m in mdu_models}
}


class BaseModel(PydanticBaseModel):
    pass


initial_uuid = uuid4()
initial_model = FMModel()
initial_model.general.fileversion = "1.12"
initial_model.general.comments.fileversion = "A test value"
initial_model.geometry.netfile.filepath = Path("test.nc")

model_mapping: Dict[UUID4, FileModel] = {initial_uuid: initial_model}

# Note that this has currently been set up for MDU files.
def get_sanitized_schema(model_type: Type) -> Dict:
    schema = dict(model_type.schema())

    # No need to send unnecessary data
    schema.pop("description", None)
    schema.pop("definitions", None)

    if "properties" in schema:
        schema["properties"].pop("comments", None)

        # we assume that every ref is a reference to another file
        # and as such replace it with a filepath.
        update_model_properties(schema["properties"])

    return schema


def update_model_properties(properties: dict) -> None:
    for (key, value) in properties.items():
        if "$ref" in value:
            properties[key] = {
                "title": key.capitalize(),
                "type": "string",
                "format": "path",
            }

        elif value["type"] == "array":
            if (
                "$ref" in value["items"] or "anyOf" in value["items"]
            ):  # "anyOf" only occurs for dryPointsFile in mdu.
                value["items"] = {
                    "type": "string",
                    "format": "path",
                }


def to_model(model_category: str, model_name: str) -> Type:
    return schema_mapping[model_category][model_name]


@app.get("/api/schema/{model_category}/{model_name}")
async def request_schema(model_category, model_name):
    return get_sanitized_schema(to_model(model_category, model_name))


@app.get("/api/models")
async def request_model_keys():
    return {"models": list(model_mapping.keys())}


@app.get("/api/models/{id}")
async def request_specific_model(id: UUID4):
    # TODO: make this more generic with a separate function
    data = model_mapping[id].dict(
        by_alias=True, exclude_defaults=False, exclude_none=False, exclude_unset=False
    )

    return data


SubmodelName = Literal[
    "general",
    "geometry",
    "volumetables",
    "numerics",
    "physics",
    "sediment",
    "waves",
    "time",
    "restart",
    "externalforcing",
    "hydrology",
    "trachytopes",
    "output",
]


class DataSpecification(str, Enum):
    comments = "comments"
    values = "values"


@app.get("/api/models/{id}/{data_type}")
async def get_model_field(
    id: UUID4, data_type: DataSpecification, submodel: SubmodelName, field: str
):
    model = model_mapping[id]
    submodel_ = getattr(model, submodel)

    value = None

    if data_type == DataSpecification.comments:
        value = getattr(submodel_.comments, field)
    elif data_type == DataSpecification.values:
        value = getattr(submodel_, field)

    return {
        "id": id,
        "subModel": submodel,
        "field": field,
        "type": str(data_type),
        "value": value,
    }


class ValueType(str, Enum):
    number = "number"
    enum = "enum"
    boolean = "boolean"
    path = "path"
    string = "string"


class FilePathModel(BaseModel):
    filepath: str


class SetFieldValueBody(BaseModel):
    value: Union[
        int,
        float,
        bool,
        str,
        List[int],
        List[float],
        List[bool],
        List[str],
        FilePathModel,
        None,
    ]
    valuetype: ValueType


class SetFieldCommentBody(BaseModel):
    value: str


@app.put("/api/models/{id}/comments", status_code=204)
async def set_model_field_comment(
    id: UUID4, submodel: SubmodelName, field: str, body: SetFieldCommentBody
):
    model = model_mapping[id]
    submodel_ = getattr(model, submodel)

    setattr(submodel_.comments, field, body.value)


@app.put("/api/models/{id}/values", status_code=204)
async def set_model_field_value(
    id: UUID4, submodel: SubmodelName, field: str, body: SetFieldValueBody
):
    model = model_mapping[id]
    submodel_ = getattr(model, submodel)

    if body.valuetype == ValueType.path:
        subsubmodel = getattr(submodel_, field)
        setattr(subsubmodel, "filepath", body.value.filepath)
    else:
        setattr(submodel_, field, body.value)
