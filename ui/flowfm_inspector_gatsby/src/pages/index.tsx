import * as React from "react"
import { PageProps } from "gatsby"
import Layout from "../components/layout"
import { InputTable, Model, Schema } from "../components/tables/input-table"
import { CollapsiblePanel } from "../components/collapsible-panel"
import Seo from "../components/seo"
import { SupportedType, ValueType } from "../components/tables/input-elements"

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

function put<TIn, TOut>(url: string, data: TIn): Promise<TOut> {
    return fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) throw new Error(response.statusText)
        else return response.json() as Promise<TOut>
    })
}

interface ModelsResult {
    models: string[]
}

interface MduResult { [key: string]: Model }
interface SchemaResult { [key: string]: Schema }

function adjustPropertyValueInModel(
    previousMduResult: MduResult,
    modelKey: string,
    fieldKey: string,
    fieldValue: SupportedType
): MduResult {
    const newResult = { ...previousMduResult };
    newResult[modelKey][fieldKey] = fieldValue;

    return newResult;
}

function adjustPropertyCommentInModel(
    previousMduResult: MduResult,
    modelKey: string,
    fieldKey: string,
    comment: string
): MduResult {
    const newResult = { ...previousMduResult };
    newResult[modelKey].comments[fieldKey] = comment;

    return newResult;
}

interface ValuePutRequest {
    value: SupportedType
    valuetype: ValueType
}

interface ValuePutResult {
    result: SupportedType
}

interface CommentPutRequest {
    value: string
}

interface CommentPutResult {
    result: string
}

const IndexPage: React.FC<PageProps> = () => {
    const [modelID, setModelID] = React.useState<string>("")
    const [modelData, setModelData] = React.useState<MduResult>({})
    const [schemaData, setSchemaData] = React.useState<SchemaResult>({})

    React.useEffect(() => {
        api<ModelsResult>(models_url)
            .then(data => {
                setModelID(data.models[0]);
                api<MduResult>(`${models_url}/${data.models[0]}`)
                    .then(v => {
                        setModelData(v)
                    });
            })

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

    function updateComment(modelName: string, fieldName: string, value: string): void {
        const setCommentPath = `${models_url}/${modelID}/comments?submodel=${modelName}&field=${fieldName}`
        put<CommentPutRequest, CommentPutResult>(setCommentPath, { value: value })
            .then(v => {
                const newState = adjustPropertyCommentInModel(
                    modelData,
                    modelName,
                    fieldName,
                    v.result
                );
                setModelData(newState);
            })
    }

    function updateValue(modelName: string, fieldName: string, value: SupportedType, valueType: ValueType): void {
        const setValuePath = `${models_url}/${modelID}/values?submodel=${modelName}&field=${fieldName}`
        put<ValuePutRequest, ValuePutResult>(setValuePath, { value: value, valuetype: valueType })
            .then(v => {
                const newState = adjustPropertyValueInModel(
                    modelData,
                    modelName,
                    fieldName,
                    v.result
                );
                setModelData(newState);
            })
    }

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
                                    schema={schemaData[tableName]}
                                    updateComment={updateComment} />
                            </CollapsiblePanel>
                        )
                    })
                }
            </div>
        </Layout>
    )
}

export default IndexPage
