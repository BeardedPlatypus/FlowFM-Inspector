import * as React from "react"
import { PageProps } from "gatsby"
import Layout from "../components/layout"
import { InputTable, Model, Schema } from "../components/tables/input-table"
import { CollapsiblePanel } from "../components/collapsible-panel"
import Seo from "../components/seo"

const schema_url = "http://localhost:8000/api/schema"

const tables = [
    "general",
    "geometry",
    "volumetables",
    "numerics",
    "physics",
    "sediment",
    "waves",
    "time",
    "restart",
    "externalforcing",
    "hydrology",
    "trachytopes",
    "output",
]

const models_url = "http://localhost:8000/api/models"

function api<T>(url: string): Promise<T> {
    return fetch(url).then(response => {
        if (!response.ok) throw new Error(response.statusText)
        else return response.json() as Promise<T>
    })
}

interface ModelsResult {
    models: string[]
}

interface MduResult { [key: string]: Model }
interface SchemaResult { [key: string]: Schema }

// TODO adjust components with React.FC
const IndexPage: React.FC<PageProps> = () => {
    const [modelData, setModelData] = React.useState<MduResult>({})
    const [schemaData, setSchemaData] = React.useState<SchemaResult>({})

    React.useEffect(() => {
        api<ModelsResult>(models_url)
            .then(data => api<MduResult>(`${models_url}/${data.models[0]}`)
                .then(setModelData))

    }, []);

    React.useEffect(() => {
        const schemas: Promise<[string, Schema]>[] = tables.map(modelName =>
            api<Schema>(`${schema_url}/mdu/${modelName}`).then(value => [modelName, value])
        )

        Promise.all(schemas)
            .then(values => {
                const schema = Object.fromEntries(new Map(values))
                setSchemaData(schema);
            })
    }, []);

    const activeTables = tables.filter(tableName => !(modelData[tableName] == null || schemaData[tableName] == null))

    return (
        <Layout>
            <Seo title="Index" />
            <div className="column">
                {
                    activeTables.map(tableName => {
                        const headerName = schemaData[tableName].title

                        return (
                            <CollapsiblePanel key={`Table:${tableName}`}
                                header={headerName}>
                                <InputTable
                                    model={modelData[tableName]}
                                    schema={schemaData[tableName]} />
                            </CollapsiblePanel>
                        )
                    })
                }
            </div>
        </Layout>
    )
}

export default IndexPage
