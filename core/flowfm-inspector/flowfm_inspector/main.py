from typing import Dict, Iterable, Type
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from hydrolib.core.io.mdu.models import (
    ExternalForcing,
    FMModel,
    General,
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
    # model = Weir(branchid="branch.001", chainage=0.5, crestlevel=1.0)
    model = FMModel().dict(
        exclude={
            "geometry",
        }
    )
    return model


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


@app.get("/api/schema/general")
async def general_schema():
    return get_sanitized_schema(General)


@app.get("/api/schema/volumetables")
async def volumetables_schema():
    return get_sanitized_schema(VolumeTables)


@app.get("/api/schema/numerics")
async def numerics_schema():
    return get_sanitized_schema(Numerics)


@app.get("/api/schema/physics")
async def physics_schema():
    return get_sanitized_schema(Physics)


@app.get("/api/schema/sediment")
async def sediment_schema():
    return get_sanitized_schema(Sediment)


@app.get("/api/schema/waves")
async def waves_schema():
    return get_sanitized_schema(Waves)


@app.get("/api/schema/time")
async def time_schema():
    return get_sanitized_schema(Time)


@app.get("/api/schema/restart")
async def restart_schema():
    return get_sanitized_schema(Restart)


@app.get("/api/schema/external_forcing")
async def external_forcing_schema():
    return get_sanitized_schema(ExternalForcing)


@app.get("/api/schema/hydrology")
async def hydrology_schema():
    return get_sanitized_schema(Hydrology)


@app.get("/api/schema/trachytopes")
async def trachytopes_schema():
    return get_sanitized_schema(Trachytopes)


@app.get("/api/schema/output")
async def output_schema():
    return get_sanitized_schema(Output)
