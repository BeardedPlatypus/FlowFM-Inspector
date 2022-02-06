from pathlib import Path


def write(content: str, write_path: Path) -> None:
    with write_path.open("w") as f:
        f.write(content)