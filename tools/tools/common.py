def clean_id(id: str) -> str:
    return id.replace("-", "_").replace(" ", "_")