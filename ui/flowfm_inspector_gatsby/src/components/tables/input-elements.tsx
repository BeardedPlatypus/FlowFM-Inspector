import * as React from "react"
import { useSpring, animated } from "react-spring"
import useResizeAware from 'react-resize-aware';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import uniqid from "uniqid"
import { useHover } from "use-events"

const wait_interval = 500;

interface InputElementProps {
    id: string
    type: ValueType

    isArrayElement?: boolean
    removeItem?: (() => void)

    shouldAnimate?: boolean
    children?: React.ReactNode

    // updateValue(value: SupportedType): void
}

const InputElement: React.FC<InputElementProps> = ({ isArrayElement, removeItem, shouldAnimate, children }) => {
    const className = `is-fullwidth is-flex is-align-items-center pl-0 pr-0 ${isArrayElement ? "pb-1" : ""}`

    const [isVisible, setIsVisible] = React.useState(!shouldAnimate)

    const { opacity } = useSpring({
        opacity: isVisible ? 1 : 0,
        delay: 100
    })

    React.useEffect(() => {
        if (!isVisible) setIsVisible(true);
    }, [])

    const [isHovered, hoverBind] = useHover();
    const [resizeListener, sizes] = useResizeAware();


    const { maxWidth, thrashOpacity } = useSpring({
        maxWidth: isHovered ? sizes.width : 0,
        thrashOpacity: isHovered ? 1 : 0,
        delay: 50,
    })

    const { margin } = useSpring({
        margin: isHovered ? "0.5rem" : "0rem",
    })

    return (
        <animated.div style={{ opacity }}>
            <div className={className} {...hoverBind}>
                {
                    (isArrayElement !== undefined && isArrayElement && removeItem !== undefined) &&
                    <div>
                        <animated.div style={{ maxWidth, opacity: thrashOpacity, marginRight: margin }}>
                            <button className="button is-danger is-outlined is-flex-grow-0 mx-1"
                                style={{ flexBasis: "0", position: "relative" }}
                                onClick={removeItem}>
                                {resizeListener}
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </animated.div>
                    </div>
                }
                {children}
                {
                    (isArrayElement !== undefined && isArrayElement) &&
                    <FontAwesomeIcon icon={faGripVertical} className="has-text-grey-light is-flex-grow-0 ml-1 pl-1" style={{ flexBasis: "0" }} />
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
        id: uniqid(),
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
                style={{ flexBasis: "auto" }}
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
        id: uniqid(),
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
        id: uniqid(),
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
        id: uniqid(),
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
                style={{ flexBasis: "auto" }}
                value={props.value == null ? "" : props.value.filepath}
                onChange={handleChange}
                type="text" />
            <input type='file'
                id='file'
                ref={inputFile}
                style={{ display: 'none' }}
                onChange={onFileChange} />
            <button className="button"
                style={{ flexBasis: "auto" }}
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
        id: uniqid(),
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

export interface SyncedInputProps<T> {
    className?: string
    type: string

    outerValue: T
    updateValue(newValue: T): void
}

type InputValues =
    | string
    | number
    | readonly string[]

const SyncedInput = <T extends InputValues,>(props: SyncedInputProps<T>) => {
    const [submitTimerID, setSubmitTimerID] = React.useState<(NodeJS.Timeout | null)>(null)
    const [currValue, setCurrentValue] = React.useState(props.outerValue)

    const submitValue = (innerValue: T) => {
        // Ignore the new comment if it is the same as the last set value.
        if (innerValue == props.outerValue) return;

        props.updateValue(innerValue)
        setSubmitTimerID(null)
    }

    const scheduleSubmitValue = (newValue: T) => {
        if (submitTimerID != null) clearTimeout(submitTimerID)
        setTimeout(() => submitValue(newValue))
    }


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const innerValue = event.target.value as T

        setCurrentValue(innerValue)
        scheduleSubmitValue(innerValue)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key == "Enter") submitValue(currValue)
    }

    return (
        <input
            value={currValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            type={props.type}
            className={props.className} />
    )
}

export interface CommentInputProps {
    comment?: string
    updateComment(newValue: string): void
}

export const CommentInput: React.FC<CommentInputProps> = (props: CommentInputProps) => {
    return (
        <SyncedInput
            className="input has-text-left"
            outerValue={props.comment}
            type="text"
            updateValue={props.updateComment} />
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


function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export const ArrayInput: React.FC<ArrayInputProps> = (props: ArrayInputProps) => {
    const [elems, setElems] = React.useState(props.elems);
    const [isDragging, setIsDragging] = React.useState(false);

    const [resizeListener, sizes] = useResizeAware();

    const handleClick = () => {
        const newElement = createDefault(props.elemType, props.enumValues)
        newElement.shouldAnimate = true
        setElems([...elems, newElement]);
    }

    const { height } = useSpring({
        height: sizes.height
    })

    function onDragEnd(result) {

        if (!result.destination) {
            return;
        }

        const newElems = reorder(
            elems,
            result.source.index,
            result.destination.index
        );

        setElems(newElems);
        setIsDragging(false);
    }

    function onDragStart(initial, provided) {
        setIsDragging(true);
    }

    function fRemoveItem(index: number): (() => void) {
        return () => {
            const newElems = Array.from(elems);
            newElems.splice(index, 1);
            setElems(newElems)
        }
    }

    return (
        <div className="is-expanded is-fullwidth">
            <animated.div style={{ height }}>
                <div style={{ overflow: 'hidden', position: 'relative' }}>
                    {resizeListener}
                    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
                        <Droppable droppableId="droppable">
                            {(provided, droppableSnapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {elems.map((elem, index) => (
                                        <Draggable key={elem.id} draggableId={elem.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={provided.draggableProps.style}
                                                >
                                                    <PropertyInputInner {...elem}
                                                        isArrayElement
                                                        removeItem={fRemoveItem(index)} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </animated.div>

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