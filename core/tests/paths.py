from pathlib import Path


class Paths:
    @staticmethod
    def test_folder() -> Path:
        return Path(__file__).parent

    @staticmethod
    def test_data_folder() -> Path:
        return Paths.test_folder() / "test-data"

    @staticmethod
    def temp_folder() -> Path:
        return Paths.test_data_folder() / "temp"
