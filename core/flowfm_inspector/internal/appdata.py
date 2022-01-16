from datetime import datetime
import json
from pathlib import Path
from platformdirs import user_data_dir
from pydantic import validator
from typing import List, Protocol

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


class AppDataFileDescriptionProtocol(Protocol):
    """AppDataFileDescriptionProtocol describes the path
    to the config file of this application.
    """

    @property
    def config_path(self) -> Path:
        """Gets the Path to the config file to be read.

        Returns:
            Path: The Path to the config file.
        """


class AppDataFileDescription(BaseModel):
    """AppDataFileDescription implements the AppDataFileDescriptionProtocol
    with the help of platformdirs.

    Properties:
        name (str): The name of the application.
        author (str): The author of the application.
    """

    name: str
    author: str

    @property
    def config_path(self) -> Path:
        return Path(user_data_dir(self.name, self.author)) / "config.json"


class AppDataContent(BaseModel):
    """AppDataContent describes the data stored in the AppDataFile

    Args:
        BaseModel ([type]): [description]
    """

    recent_projects: RecentProjectData = RecentProjectData()


class AppDataManager:
    """The AppDataManager contains a AppDataFileDescriptionProtocol
    and some content. It is responsible for reading and writing said
    content to file.
    """

    def __init__(self, appdata_description: AppDataFileDescriptionProtocol) -> None:
        self._description: AppDataFileDescriptionProtocol = appdata_description
        self._content: AppDataContent = self._init_content()

    def _init_content(self) -> AppDataContent:
        """Create a new AppDataContent.

        If no AppData file has been created before, it will be created. Otherwise
        it will be read from disk.

        Returns:
            AppData: The read AppData object.
        """
        try:
            return AppDataManager._load_content_from_disk(self._description.config_path)
        except FileNotFoundError:
            # Could not read the file because it did not exist or was corrupted.
            return AppDataManager._create_new_content()

    def _write(self) -> None:
        """Write this AppDataContent to the appdata location."""
        AppDataManager._write_content_to_disk(
            self._description.config_path, self._content
        )

    @staticmethod
    def _load_content_from_disk(path: Path) -> AppDataContent:
        return AppDataContent.parse_file(path)

    @staticmethod
    def _create_new_content() -> AppDataContent:
        return AppDataContent()

    @staticmethod
    def _write_content_to_disk(path: Path, content: AppDataContent) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w") as f:
            f.write(content.json())

    def update_recent_project(self, recent_project: Path) -> None:
        """Update the recent project associated with the specified recent_project.

        This updates the data on disk.

        Args:
            recent_project (Path): The path to the project to update.
        """
        self._content.recent_projects.update_project(recent_project)
        self._write()
