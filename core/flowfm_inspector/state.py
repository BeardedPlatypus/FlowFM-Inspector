from flowfm_inspector.internal.appdata import (
    AppDataFileDescription,
    AppDataManager,
)


appdata_description = AppDataFileDescription(
    name="FlowFM-inspector", author="BeardedPlatypus"
)

appdata = AppDataManager(appdata_description)
