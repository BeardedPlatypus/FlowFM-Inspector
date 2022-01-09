import * as React from "react"

import * as styles from "./input-table.module.scss"
import * as InputElems from "./input-elements"

import uniqid from "uniqid"


// DataInterpretation
export interface Schema {
    title: string
    properties: { [key: string]: ValueDescription }
}

export interface Model {
    comments: { [key: string]: string }
    [key: string]: InputElems.SupportedType | { [key: string]: string }
}

export type BaseValueDescription =
    | { enum: string[] }
    | { type: string, format: string }
    | { type: string }

export type CompositeValueDescription =
    | { items: BaseValueDescription }

export type ValueDescription =
    | BaseValueDescription
    | CompositeValueDescription

function toValueType(val: string): InputElems.ValueType {
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
            return "string";
    }
}

interface RowDescription {
    table: string
    rowKey: string
    valueType: InputElems.ValueType
    isArray: boolean
    enumValues: string[]
}

function getBaseValueProps(
    description: RowDescription,
    value: any,
    updateValue: InputElems.UpdateValueFunc
): InputElems.InputBaseProps {
    const id = uniqid();
    switch (description.valueType) {
        case "number":
            return { id: id, type: "number", value: value as number, updateValue: updateValue }
        case "boolean":
            return { id: id, type: "boolean", value: value as boolean, updateValue: updateValue }
        case "enum":
            return { id: id, type: "enum", value: value as string, enumValues: description.enumValues, updateValue: updateValue }
        case "path":
            return { id: id, type: "path", value: value as { filepath: string }, updateValue: updateValue }
        case "string":
            return { id: id, type: "string", value: String(value), updateValue: updateValue }
    }
}

function getCompositeValueProps(description: RowDescription, value: any, updateValue: (value: InputElems.BaseSupportedType[]) => void): InputElems.ArrayInputProps {
    const elems = value as any[] == null ? [] : value as any[]

    return {
        type: "array",
        elemType: description.valueType,
        elems: elems,
        enumValues: description.enumValues,
        updateValue: updateValue
    }
}

function getValueProps(description: RowDescription, model: Model, updateValue: (value: InputElems.SupportedType) => void): InputElems.InputProps {
    const key = description.rowKey

    let value;
    if (key in model) {
        value = model[key]
    } else {
        console.warn(`The key ${key} is not available in the provided model.`)
        value = null
    }


    if (description.isArray) {
        return getCompositeValueProps(description, value, updateValue)
    }
    else {
        return getBaseValueProps(description, value, updateValue)
    }
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

function getRows({ properties, title }: Schema): RowDescription[] {
    function getBaseValueType(value: BaseValueDescription): InputElems.ValueType {
        const is_enum = "enum" in value
        if (is_enum) return "enum"

        const is_path = value.type === "string" && "format" in value && value.format === "path"
        if (is_path) return "path"

        return toValueType(value.type)
    }

    function getValueType(value: ValueDescription): InputElems.ValueType {
        const is_array = "items" in value
        if (is_array) return getBaseValueType(value.items)

        return getBaseValueType(value)
    }

    function toRow(tableTitle: string, [key, value]: [string, ValueDescription]): RowDescription {
        return {
            table: tableTitle,
            rowKey: key,
            valueType: getValueType(value),
            isArray: "items" in value,
            enumValues: "enum" in value ? value.enum : [],
        }
    }

    return Object.entries(properties).map(v => toRow(title, v))
}

interface TableRowProps {
    rowKey: string
    comment?: string
    children?: React.ReactNode
    updateComment(value: string): void
}

const TableRow: React.FC<TableRowProps> = (props: TableRowProps) => {
    return (
        <tr>
            <td className={styles.keyColumn}>{props.rowKey}</td>
            <td className={styles.valueColumn}>{props.children}</td>
            <td className={styles.commentColumn}>
                <InputElems.Control>
                    <InputElems.CommentInput comment={props.comment} updateComment={props.updateComment} />
                </InputElems.Control>
            </td>
        </tr>
    )
}

export interface TableProps {
    model: Model
    schema: Schema
    updateValue: (modelName: string, fieldName: string, value: InputElems.SupportedType, valueType: InputElems.ValueType) => void
    updateComment: (modelName: string, fieldName: string, value: string) => void
}

export const InputTable: React.FC<TableProps> = (props: TableProps) => {
    function generateTableRow(description: RowDescription) {
        const updateValue = (newValue) => (props.updateValue(description.table.toLowerCase(), description.rowKey, newValue, description.valueType))
        let valueProps = getValueProps(description, props.model, updateValue)

        const updateComment = (newComment) => (props.updateComment(description.table.toLowerCase(), description.rowKey.toLowerCase(), newComment))

        return (
            <TableRow key={`Table:${props.schema.title}:${description.rowKey}`}
                updateComment={updateComment}
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
