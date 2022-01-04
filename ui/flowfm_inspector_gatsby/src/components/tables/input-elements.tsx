import * as React from "react"
import { useSpring, animated } from "react-spring"
import useResizeAware from 'react-resize-aware';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'

interface InputElementProps {
    type: ValueType
    isArrayElement?: boolean
    shouldAnimate?: boolean
    children?: React.ReactNode
}

const InputElement: React.FC<InputElementProps> = ({ isArrayElement, shouldAnimate, children }) => {
    const className = `is-flex is-align-items-center ${isArrayElement ? "mb-1 pb-1" : ""}`

    const { opacity } = useSpring({
        to: { opacity: 1 },
        from: { opacity: shouldAnimate !== undefined && shouldAnimate ? 0 : 1 },
        delay: 100
    })


    return (
        <animated.div style={{ opacity }}>
            <div className={className}>
                {children}
                {
                    (isArrayElement !== undefined && isArrayElement) &&
                    <FontAwesomeIcon icon={faGripVertical} className="has-text-grey-light ml-1 pl-1" />
                }
            </div>
        </animated.div>
    )
}

export interface NumberInputProps extends InputElementProps {
    type: "number";
    value: number;
}

function defaultNumberInputProps(): NumberInputProps {
    return {
        type: "number",
        value: 1.0,
    }
}

export const NumberInput: React.FC<NumberInputProps> = (props: NumberInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.value = Number(event.target.value)
    }

    return (
        <InputElement {...props}>
            <input className="input has-text-right"
                value={props.value == null ? "" : props.value}
                onChange={handleChange}
                type="number" />
        </InputElement>
    )
}

export interface EnumInputProps extends InputElementProps {
    type: "enum";
    value: string;
    enumValues: string[];
}

function defaultEnumInputProps(enumValues: string[]): EnumInputProps {
    return {
        type: "enum",
        value: enumValues[0],
        enumValues: enumValues,
    }
}

export const EnumInput: React.FC<EnumInputProps> = (props: EnumInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.value = event.target.value
    }

    return (
        <InputElement {...props}>
            <div className="select is-fullwidth">
                <select className="has-text-right"
                    value={props.value}
                    onChange={handleChange}>
                    {props.enumValues.map(v => <option key={String(v)} value={v}>{v}</option>)}
                </select>
            </div>
        </InputElement>
    )
}

export interface BooleanInputProps extends InputElementProps {
    type: "boolean";
    value: boolean;
}

function defaultBooleanInputProps(): BooleanInputProps {
    return {
        type: "boolean",
        value: false,
    }
}

export const BooleanInput: React.FC<BooleanInputProps> = (props: BooleanInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.value = Boolean(event.target.value)
    }

    return (
        <InputElement {...props}>
            <div className="select is-fullwidth">
                <select className="has-text-right"
                    value={String(props.value)}
                    onChange={handleChange}>
                    <option value={String(true)}>True</option>
                    <option value={String(false)}>False</option>
                </select>
            </div>
        </InputElement>
    )
}

export interface PathInputProps extends InputElementProps {
    type: "path";
    value: { filepath: string } | null;
}

function defaultPathInputProps(): PathInputProps {
    return {
        type: "path",
        value: null,
    }
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
        <InputElement {...props}>
            <input className="input has-text-right"
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
        </InputElement>
    )
}

export interface StringInputProps extends InputElementProps {
    type: "string";
    value: string;
}

function defaultStringInputProps(): StringInputProps {
    return {
        type: "string",
        value: "",
    }
}

export const StringInput: React.FC<StringInputProps> = (props: StringInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.value = event.target.value
    }

    return (
        <InputElement {...props}>
            <input className="input has-text-right"
                value={props.value}
                onChange={handleChange}
                type="text" />
        </InputElement>
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
        <div className="control">
            {children}
        </div>
    )
}

export interface ArrayInputProps {
    type: "array"
    elemType: ValueType
    elems: InputBaseProps[]
    enumValues?: string[]
}

function createDefault(type: ValueType, enumValues?: string[]): InputBaseProps {
    switch (type) {
        case "number":
            return defaultNumberInputProps();
        case "enum":
            return defaultEnumInputProps(enumValues);
        case "boolean":
            return defaultBooleanInputProps();
        case "path":
            return defaultPathInputProps();
        case "string":
            return defaultStringInputProps();
    }
}

export type ValueType =
    | "number"
    | "enum"
    | "boolean"
    | "path"
    | "string"

export const ArrayInput: React.FC<ArrayInputProps> = (props: ArrayInputProps) => {
    const [elems, setElems] = React.useState(props.elems)

    const [resizeListener, sizes] = useResizeAware();

    const handleClick = () => {
        const newElement = createDefault(props.elemType, props.enumValues)
        newElement.shouldAnimate = true
        setElems([...elems, newElement]);
    }

    const { maxHeight } = useSpring({
        maxHeight: sizes.height
    })

    return (
        <div className="is-expanded is-fullwidth">
            <div style={{ overflow: 'hidden' }}>
                {resizeListener}
                <animated.div style={{ maxHeight: maxHeight }}>
                    {
                        elems.map(elem =>
                            <PropertyInputInner {...elem} isArrayElement />
                        )
                    }
                </animated.div>
            </div>
            <div className="is-expanded is-fullwidth">
                <button className="button is-expanded is-fullwidth is-light" onClick={handleClick}>
                    Add item
                </button>
            </div>
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

const PropertyInputInner: React.FC<InputProps> = (props: InputProps) => {
    switch (props.type) {
        case "number":
            return (
                <NumberInput {...props} />
            )
        case "boolean":
            return (
                <BooleanInput {...props} />
            )
        case "enum":
            return (
                <EnumInput {...props} />
            )
        case "path":
            return (
                <PathInput {...props} />
            )
        case "string":
            return (
                <StringInput {...props} />
            )
        case "array":
            return (
                <ArrayInput {...props} />
            )
    }
}


export const PropertyInput: React.FC<InputProps> = (props: InputProps) => {
    return (
        <Control>
            <PropertyInputInner {...props} />
        </Control>
    )
}