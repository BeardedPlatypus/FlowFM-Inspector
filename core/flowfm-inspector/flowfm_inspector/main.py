from typing import Dict, Iterable, Type
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


# The network is currently problematic and we do not want to load it.
NetworkModel.__fields__.pop("network", None)

app = FastAPI()


origins = ["http://localhost:8002", "localhost:8002"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    model = FMModel().dict(
        exclude={
            "geometry",
        }
    )
    return model


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


model_mapping: Dict[str, Dict[str, Type]] = {
    "mdu": {m.__name__.lower(): m for m in mdu_models}
}


class BaseModel(PydanticBaseModel):
    pass


def get_sanitized_schema(model_type: Type) -> Dict:
    schema = dict(model_type.schema())

    schema.pop("description", None)

    if "properties" in schema:
        schema["properties"].pop("comments", None)

        # we assume that every ref is a reference to another file
        # and as such replace it with a filepath.
        referenced_properties: Iterable[str] = (
            key for (key, value) in schema["properties"].items() if "$ref" in value
        )

        for key in referenced_properties:
            print(key)
            print(schema["properties"][key])
            schema["properties"][key] = {
                "title": key.capitalize(),
                "type": "string",
                "format": "path",
            }

    return schema


def to_model(model_category: str, model_name: str) -> Type:
    return model_mapping[model_category][model_name]


@app.get("/api/schema/{model_category}/{model_name}")
async def request_schema(model_category, model_name):
    return get_sanitized_schema(to_model(model_category, model_name))
