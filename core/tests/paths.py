from pathlib import Path


class Paths:
    @staticmethod
    def test_folder() -> Path:
        return Path(__file__).parent
