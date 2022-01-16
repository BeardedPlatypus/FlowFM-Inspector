import json
from pathlib import Path
import shutil
from flowfm_inspector.internal.appdata import AppDataContent
from tests.paths import Paths


class TestAppDataFileContent:
    @staticmethod
    def get_test_data_folder(name: str) -> Path:
        return Paths.temp_folder() / TestAppDataFileContent.__name__ / name

    def test_write_read_yields_same_results(self):
        write_folder = TestAppDataFileContent.get_test_data_folder(
            TestAppDataFileContent.test_write_read_yields_same_results.__name__
        )

        if write_folder.is_dir():
            shutil.rmtree(write_folder)

        write_folder.mkdir(parents=True)
        write_path = write_folder / "content.json"

        content = AppDataContent()

        for index in range(5):
            p = write_folder / f"file_{index}.mdu"

            with p.open("w") as f:
                f.write("Made you look.")

            content.recent_projects.update_project(p)

        with write_path.open("w") as f:
            f.write(content.json())

        with write_path.open("r") as f:
            data = json.load(f)
            result = AppDataContent.parse_obj(data)

        assert result == content
