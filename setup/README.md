# Setup - MSI build configuration

The setup component is responsible for building the FlowFM-Inspector msi. It is build
with [the WiX Toolset][WiX]. The entry point of the WiX project is the [product.wxs](FlowFM-Inspector/Product.wxs).
The [Directories.wxs](FlowFM-Inspector/Directories.wxs) and the component fragments are generated
with the [tools script](/tools/README.md). 

[WiX]: https://wixtoolset.org/

## Prebuilt MSIs

The prebuilt MSIs can be found at the following locations:

* Latest release: *coming soon*
* Development: [Azure Devops Pipeline][AzureDevOps]

[AzureDevOps]: https://dev.azure.com/mwtegelaers/FlowFM%20Inspector/_build?definitionId=34

## Building the MSI locally

The msi can be build locally by running the following steps:

First we need to build the different components of the FlowFM-Inspector application:

* [core](/core/README.md): The FastAPI / HYDROLIB-Core backend, which should be packaged PyInstaler
* [ui](/ui/README.md): The Gatsby front-end, which should be build for production with `gatsby build`
* [app](/app/README.md): The Edge WebView2 host application, which should be compiled with .NET

The compiled files should be placed in a `build` folder placed in the root of the 
repository with the following directory hierarchy:

```
build
├───core
│    └─── <The contents of the PyInstaller package>
├───ui
│    └─── <The contents of the gatsby build public folder>
└───<app binary contents>
```

Once the build folder is prepared the following python scripts should be run:

```bash
# The scripts are executed from the tools folder
cd <repository base>/tools

# Generate the Directories.wxs fragment with the generate-directories fragment:
poetry run python .\tools\main.py generate-directories-fragment "../build" --target-directory "../setup/FlowFM-Inspector" --excluded-directories "runtimes"

# Generate the core.wxs, ui.wxs, and app.wxs fragments with the generate-component-fragment command:
poetry run python .\tools\main.py generate-component-fragment "../build" "core" --included-paths "core" --target-directory "../setup/FlowFM-Inspector/Components"
poetry run python .\tools\main.py generate-component-fragment "../build" "ui" --included-paths "ui" --target-directory "../setup/FlowFM-Inspector/Components"
poetry run python .\tools\main.py generate-component-fragment "../build" "app" --included-paths "." --excluded-paths "ui" --excluded-paths "core" --excluded-paths "runtimes" --target-directory "../setup/FlowFM-Inspector/Components" --additional-component-groups-refs "app..executable" --excluded-paths "FlowFM-Inspector.exe"
```

After this step, the [`Directories.wxs`](FlowFM-Inspector/Directories.wxs), [`app.wxs`](FlowFM-Inspector/Components/app.wxs), [`core.wxs`](FlowFM-Inspector/Components/core.wxs), and the [`ui.wxs`](FlowFM-Inspector/Components/ui.wxs) should be generated and describe the contents of the `build` folder. It is now possible to build the msi by opening the `setup/FlowFM-Inspector-setup.sln` with Visual Studio. For this you need the [WiX Toolset](https://wixtoolset.org/) and the [WiX Toolset visual studio plugin](https://marketplace.visualstudio.com/items?itemName=WixToolset.WixToolsetVisualStudio2022Extension) to be installed.