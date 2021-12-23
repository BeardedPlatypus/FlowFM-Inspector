from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from hydrolib.core.io.structure.models import Weir
from hydrolib.core.io.mdu.models import FMModel, General


app = FastAPI()


origins = ["http://localhost:8001", "localhost:8001"]


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


@app.get("/api/schema/general")
async def general_schema():
    schema = dict(General.schema())

    # Clean up the schema
    if "properties" in schema and "comments" in schema["properties"]:
        del schema["properties"]["comments"]
    return schema
