import * as React from "react"

import * as styles from "./input-table.module.scss"
import * as InputElems from "./input-elements"


interface TableRowProps {
    rowKey: string
    comment?: string
    children?: React.ReactNode
}

const TableRow: React.FC<TableRowProps> = (props: TableRowProps) => {
    return (
        <tr>
            <td className={styles.keyColumn}>{props.rowKey}</td>
            <td className={styles.valueColumn}>{props.children}</td>
            <td className={styles.commentColumn}>
                <InputElems.Control>
                    <InputElems.CommentInput comment={props.comment} />
                </InputElems.Control>
            </td>
        </tr>
    )
}

export type ValueDescription =
    | { enum: string[] }
    | { type: string, format: string }
    | { type: string }

export interface Schema {
    title: string
    properties: { [key: string]: ValueDescription }
}

export interface Model {
    comments: { [key: string]: string }
    [key: string]: InputElems.SupportedType | { [key: string]: string }
}

interface CommentData {
    comments?: { [key: string]: string }
}

function getComment(key: string, data?: CommentData): string {
    // Comments are stored with lowercase keys.
    return (data == null || data.comments == null || data.comments[key.toLowerCase()] == null)
        ? ""
        : data.comments[key.toLowerCase()];
}

function getValueProps(description: RowDescription, model: Model): InputElems.InputProps {
    const key = description.rowKey

    if (!(key in model)) {
        throw new Error(`The key ${key} is not available in the provided model.`)
    }

    const valueRaw: any = model[key]

    switch (description.valueType) {
        case "number":
            return { type: "number", value: valueRaw as number }
        case "boolean":
            return { type: "boolean", value: valueRaw as boolean }
        case "enum":
            return { type: "enum", value: valueRaw as string, enumValues: description.enumValues }
        case "path":
            return { type: "path", value: valueRaw as { filepath: string } }
        case "string":
            return { type: "string", value: String(valueRaw) }
    }
}

type ValueType =
    | "number"
    | "enum"
    | "boolean"
    | "path"
    | "string"

function toValueType(val: string): ValueType {
    switch (val) {
        case "number":
        case "integer":
            return "number";
        case "enum":
            return "enum";
        case "boolean":
            return "boolean";
        case "path":
            return "path";
        case "string":
        default:
            return "string"
    }
}

interface RowDescription {
    table: string
    rowKey: string
    valueType: ValueType
    enumValues: string[]
}

function getRows({ properties, title }: Schema): RowDescription[] {
    function getValueType(value: ValueDescription): ValueType {
        const is_enum = "enum" in value
        if (is_enum) return "enum"

        const is_path = value.type === "string" && "format" in value && value.format === "path"
        if (is_path) return "path"

        return toValueType(value.type)
    }

    function toRow(tableTitle: string, [key, value]: [string, ValueDescription]): RowDescription {
        return {
            table: tableTitle,
            rowKey: key,
            valueType: getValueType(value),
            enumValues: "enum" in value ? value.enum : [],
        }
    }

    return Object.entries(properties).map(v => toRow(title, v))
}

export interface TableProps {
    model: Model
    schema: Schema
}

export const InputTable: React.FC<TableProps> = (props: TableProps) => {
    function generateTableRow(description: RowDescription) {
        let valueProps = getValueProps(description, props.model)

        return (
            <TableRow key={`Table:${props.schema.title}:${description.rowKey}`}
                comment={getComment(description.rowKey, props.model)}
                rowKey={description.rowKey}>
                <InputElems.PropertyInput {...valueProps} />
            </TableRow>
        )
    }

    const tableRows = getRows(props.schema)

    return (
        <div className="table-container ml-6 mr-6 pb-4 pt-4" >
            <table className="table is-hoverable is-fullwidth">
                <thead>
                    <tr>
                        <th className={styles.keyColumn}>Key</th>
                        <th className={styles.valueColumn}>Value</th>
                        <th className={styles.commentColumn}>Comment</th>
                    </tr>
                </thead>
                <tbody>{tableRows.map(generateTableRow)}</tbody>
            </table>
        </div>
    )
}
