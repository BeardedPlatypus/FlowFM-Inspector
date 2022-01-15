from datetime import datetime
import json
from pathlib import Path
from platformdirs import user_data_dir
from pydantic import validator
from typing import List, Literal

from flowfm_inspector.basemodel import BaseModel


class RecentProject(BaseModel):
    """Recent project defines a single recent project consisting of an absolute path
    and the time it was last opened.

    Properties:
        project_path (Path): The absolute path to the project.
        last_opened (datetime): The time this project was last opened.
    """

    project_path: Path
    last_opened: datetime


class RecentProjectData(BaseModel):
    """RecentProjectData defines the objects used to manage the recent projects of this
    FlowFM Inspector.

    Properties:
        recent_projects (List[RecentProject]): the list of recent projects.
    """

    recent_projects: List[RecentProject] = []

    @validator("recent_projects")
    def recent_projects_should_exist(cls, v: List[RecentProject]):
        """Ensure all recent projects exist.

        Note that we do persist this data at this  point, this will be
        persisted upon the next save, or cleaned up again the next time
        this object is created.

        Args:
            v (List[RecentProject]): The initial recent projects value.

        Returns:
            [List[RecentProject]]: The list of existing recent projects.
        """
        return [rp for rp in v if rp.project_path.exists()]

    def update_project(self, recent_project_path: Path) -> None:
        """Update the RecentProject associated with the specified recent
        project path to be opened at this time.

        Args:
            recent_project_path (Path): The path to the recent project to be updated.
        """
        updated_projects = [
            rp for rp in self.recent_projects if rp.project_path != recent_project_path
        ]
        updated_recent_project = RecentProject(
            project_path=recent_project_path, last_opened=datetime.now()
        )
        updated_projects.insert(0, updated_recent_project)
        self.recent_projects = updated_projects


class AppData(BaseModel):
    """The AppData describes the data stored in the app data folder of the FlowFM inspector.

    Properties:
        recent_projects (List[RecentProject]): The recently opened projects.
    """

    recent_projects: RecentProjectData = RecentProjectData()

    _appname: Literal["FlowFM-Inspector"] = "FlowFM-Inspector"
    _app_author: Literal["BeardedPlatypus"] = "BeardedPlatypus"

    _appdata_path: Path = Path(user_data_dir(_appname, _app_author)) / "config.json"

    def write(self) -> None:
        """Write this AppData to the appdata location."""
        with self._appdata_path.open("w") as f:
            json.dump(self.dict(), f)

    @classmethod
    def read(cls) -> "AppData":
        """Read the AppData and return a new AppData instance.

        If no AppData file has been created before, it will be created.

        Returns:
            AppData: The read AppData object.
        """
        try:
            return cls._load_from_disk()
        except OSError:
            # Could not read the file because it did not exist or was corrupted.
            return cls._create_new()

    @classmethod
    def _load_from_disk(cls) -> "AppData":
        with cls._appdata_path.open("r") as f:
            json_data = json.load(f)
            return cls.parse_obj(json_data)

    @classmethod
    def _create_new(cls) -> "AppData":
        data = AppData()
        data.write()
        return data

    def update_recent_project(self, recent_project: Path) -> None:
        """Update the recent project associated with the specified recent_project.

        This updates the data on disk.

        Args:
            recent_project (Path): The path to the project to update.
        """
        self.recent_projects.update_project(recent_project)
        self.write()
