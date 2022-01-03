import * as React from "react"

export interface NumberInputProps {
    type: "number";
    value: number;
}

export const NumberInput: React.FC<NumberInputProps> = (props: NumberInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.value = Number(event.target.value)
    }

    return (
        <input className="input has-text-right"
            value={props.value == null ? "" : props.value}
            onChange={handleChange}
            type="number" />
    )
}

export interface EnumInputProps {
    type: "enum";
    value: string;
    enumValues: string[];
}

export const EnumInput: React.FC<EnumInputProps> = (props: EnumInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.value = event.target.value
    }

    return (
        <div className="select is-fullwidth">
            <select className="is-fullwidth has-text-right"
                value={props.value}
                onChange={handleChange}>
                {props.enumValues.map(v => <option key={String(v)} value={v}>{v}</option>)}
            </select>
        </div>
    )
}

export interface BooleanInputProps {
    type: "boolean";
    value: boolean;
}

export const BooleanInput: React.FC<BooleanInputProps> = (props: BooleanInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.value = Boolean(event.target.value)
    }

    return (
        <div className="select is-fullwidth">
            <select className="is-fullwidth has-text-right"
                value={String(props.value)}
                onChange={handleChange}>
                <option value={String(true)}>True</option>
                <option value={String(false)}>False</option>
            </select>
        </div>
    )
}

export interface PathInputProps {
    type: "path";
    value: { filepath: string } | null;
}

export const PathInput: React.FC<PathInputProps> = (props: PathInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.value.filepath = event.target.value
    }

    const inputFile = React.useRef(null)

    const onButtonClick = () => {
        inputFile.current.click();
    }

    const onFileChange = (event) => {
        console.log(event.target.files)
    }

    return (
        <div className="is-expanded is-fullwidth is-flex">
            <input className="input has-text-right flex-grow"
                value={props.value == null ? "" : props.value.filepath}
                onChange={handleChange}
                type="text" />
            <input type='file'
                id='file'
                ref={inputFile}
                style={{ display: 'none' }}
                onChange={onFileChange} />
            <button className="button"
                onClick={onButtonClick}>
                ...
            </button>
        </div>
    )
}

export interface StringInputProps {
    type: "string";
    value: string;
}

export const StringInput: React.FC<StringInputProps> = (props: StringInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.value = event.target.value
    }

    return (
        <input className="input has-text-right"
            value={props.value}
            onChange={handleChange}
            type="text" />
    )
}

export interface CommentInputProps {
    comment?: string
}

export const CommentInput: React.FC<CommentInputProps> = (props: CommentInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.comment = event.target.value
    }

    return (
        <input className="input has-text-left"
            value={props.comment == null ? "" : props.comment}
            onChange={handleChange}
            type="text" />
    )
}

export interface ControlProps {
    children?: React.ReactNode
}

export const Control: React.FC<ControlProps> = ({ children }: ControlProps) => {
    return (
        <div className="control is-expanded is-fullwidth">
            {children}
        </div>
    )
}

export interface ArrayInputProps {
    type: "array"
    elems: InputBaseProps[]
}

export const ArrayInput: React.FC<ArrayInputProps> = (props: ArrayInputProps) => {
    return (
        <div className="is-expanded is-fullwidth">
            {props.elems.map(elem => <PropertyInput {...elem} />)}
        </div>
    )
}

export type InputBaseProps =
    | NumberInputProps
    | EnumInputProps
    | BooleanInputProps
    | PathInputProps
    | StringInputProps

export type InputCompositeProps =
    | ArrayInputProps

export type InputProps =
    | InputBaseProps
    | InputCompositeProps

export type SupportedType =
    | number
    | boolean
    | string
    | ({ filepath: string } | null)
    | number[]
    | boolean[]
    | string[]
    | ({ filepath: string } | null)[]


export const PropertyInput: React.FC<InputProps> = (props: InputProps) => {
    switch (props.type) {
        case "number":
            return (
                <Control>
                    <NumberInput {...props} />
                </Control>
            )
        case "boolean":
            return (
                <Control>
                    <BooleanInput {...props} />
                </Control>
            )
        case "enum":
            return (
                <Control>
                    <EnumInput {...props} />
                </Control>
            )
        case "path":
            return (
                <Control>
                    <PathInput {...props} />
                </Control>
            )
        case "string":
            return (
                <Control>
                    <StringInput {...props} />
                </Control>
            )
        case "array":
            return (
                <Control>
                    <ArrayInput {...props} />
                </Control>
            )
    }
}
