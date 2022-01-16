from fastapi import APIRouter, status
from pathlib import Path
from flowfm_inspector.state import appdata
from flowfm_inspector.basemodel import BaseModel


router = APIRouter(prefix="/api/appdata", tags=["appdata"])


@router.get("/recent-projects", tags=["appdata"])
async def retrieve_recent_projects():
    return appdata.content.recent_projects.dict()


class RecentProjectPutBody(BaseModel):
    path: Path


@router.put(
    "/recent-projects", tags=["appdata"], status_code=status.HTTP_204_NO_CONTENT
)
async def update_recent_project(body: RecentProjectPutBody):
    appdata.update_recent_project(body.path)
