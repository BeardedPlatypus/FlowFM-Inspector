from fastapi import FastAPI
from hydrolib.core.io.structure.models import Weir


app = FastAPI()


@app.get("/")
async def root():
    model = Weir(branchid="branch.001", chainage=0.5, crestlevel=1.0)
    return model
