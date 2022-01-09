import * as React from "react"
import { useSpring, animated } from "react-spring"
import useResizeAware from 'react-resize-aware';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import uniqid from "uniqid"
import { useHover } from "use-events"

const wait_interval = 500;

export type UpdateValueFunc = (value: BaseSupportedType) => void

interface InputElementProps {
    id: string
    value: BaseSupportedType
    type: ValueType

    isArrayElement?: boolean
    removeItem?: (() => void)

    shouldAnimate?: boolean
    children?: React.ReactNode
    updateValue: UpdateValueFunc
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

function defaultNumberInputProps(updateValue: (id: string) => UpdateValueFunc): NumberInputProps {
    const id = uniqid()
    return {
        id: id,
        type: "number",
        value: 1.0,
        updateValue: (value) => (updateValue(id)(value))
    }
}

export const NumberInput: React.FC<NumberInputProps> = (props: NumberInputProps) => {
    return (
        <InputElement {...props}>
            <SyncedInput
                className="input has-text-right"
                style={{ flexBasis: "auto" }}
                outerValue={props.value == null ? "" : props.value}
                type="number"
                updateValue={props.updateValue} />
        </InputElement>
    )
}

export interface EnumInputProps extends InputElementProps {
    type: "enum";
    value: string;
    enumValues: string[];
}

function defaultEnumInputProps(enumValues: string[], updateValue: (id: string) => UpdateValueFunc): EnumInputProps {
    const id = uniqid()
    return {
        id: id,
        type: "enum",
        value: enumValues[0],
        enumValues: enumValues,
        updateValue: updateValue(id),
    }
}

export const EnumInput: React.FC<EnumInputProps> = (props: EnumInputProps) => {
    const [selectedValue, setSelectedValue] = React.useState(props.value)

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSelectedValue = event.target.value

        if (newSelectedValue === selectedValue) return;

        setSelectedValue(newSelectedValue)
        props.updateValue(newSelectedValue)
    }

    return (
        <InputElement {...props}>
            <div className="select is-fullwidth">
                <select className="has-text-right"
                    value={selectedValue}
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

function defaultBooleanInputProps(updateValue: (id: string) => UpdateValueFunc): BooleanInputProps {
    const id = uniqid()
    return {
        id: id,
        type: "boolean",
        value: false,
        updateValue: updateValue(id)
    }
}

export const BooleanInput: React.FC<BooleanInputProps> = (props: BooleanInputProps) => {
    const [selectedValue, setSelectedValue] = React.useState<boolean>(props.value)

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event.target.value)
        const newSelectedValue = event.target.value == "true"

        if (newSelectedValue === selectedValue) return;

        setSelectedValue(newSelectedValue)
        props.updateValue(newSelectedValue)
    }

    return (
        <InputElement {...props}>
            <div className="select is-fullwidth">
                <select className="has-text-right"
                    value={String(selectedValue)}
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

function defaultPathInputProps(updateValue: (id: string) => UpdateValueFunc): PathInputProps {
    const id = uniqid()
    // TODO: add proper updateValue
    return {
        id: id,
        type: "path",
        value: null,
        updateValue: (value) => { },
    }
}

// TODO: properly implement behaviour on 
export const PathInput: React.FC<PathInputProps> = (props: PathInputProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.value.filepath = event.target.value
    }

    const inputFile = React.useRef(null)

    const onButtonClick = () => {
        inputFile.current.click();
    }

    const onFileChange = (event) => {
        // TODO: Add logic for opening model selection screen
        console.log(event.target.files)
    }

    return (
        <InputElement {...props}>
            <input className="input has-text-right"
                style={{ flexBasis: "auto" }}
                value={props.value == null ? "" : props.value.filepath}
                onChange={handleChange}
                type="text"
                readOnly />
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

function defaultStringInputProps(updateValue: (id: string) => UpdateValueFunc): StringInputProps {
    const id = uniqid()
    return {
        id: id,
        type: "string",
        value: "",
        updateValue: updateValue(id)
    }
}

export const StringInput: React.FC<StringInputProps> = (props: StringInputProps) => {
    return (
        <InputElement {...props}>
            <SyncedInput className="input has-text-right"
                outerValue={props.value}
                updateValue={props.updateValue}
                type="text" />
        </InputElement>
    )
}

export interface SyncedInputProps<T> {
    className?: string
    style?: React.CSSProperties
    type: string

    outerValue: T
    updateValue(newValue: T): void
}

type InputValues =
    | string
    | number

const SyncedInput = <T extends InputValues,>(props: SyncedInputProps<T>) => {
    const [submitTimerID, setSubmitTimerID] = React.useState<(NodeJS.Timeout | null)>(null)
    const [currValue, setCurrentValue] = React.useState(props.outerValue)

    const submitValue = (innerValue: T) => {
        props.updateValue(innerValue)
        setSubmitTimerID(null)
    }

    const scheduleSubmitValue = (newValue: T) => {
        if (submitTimerID != null) clearTimeout(submitTimerID)
        const id = setTimeout(() => submitValue(newValue), wait_interval)
        setSubmitTimerID(id)
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
            className={props.className}
            style={props.style} />
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
    elems: BaseSupportedType[]
    enumValues?: string[]
    updateValue: (value: BaseSupportedType[]) => void
}

function createDefault(type: ValueType, updateValue: (id: string) => UpdateValueFunc, enumValues?: string[]): InputBaseProps {
    switch (type) {
        case "number":
            return defaultNumberInputProps(updateValue);
        case "enum":
            return defaultEnumInputProps(enumValues, updateValue);
        case "boolean":
            return defaultBooleanInputProps(updateValue);
        case "path":
            return defaultPathInputProps(updateValue);
        case "string":
            return defaultStringInputProps(updateValue);
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
    const createElem = (value: BaseSupportedType) => createDefault(props.elemType, updateValueElem, props.enumValues)

    const [elems, setElems] = React.useState<InputBaseProps[]>(props.elems.map(createElem))
    const [isDragging, setIsDragging] = React.useState(false);

    const [resizeListener, sizes] = useResizeAware();

    function updateIndividualElement(inputProps: InputBaseProps, id: string, value: BaseSupportedType) {
        if (inputProps.id !== id) return inputProps;

        const newInputProps = { ...inputProps }
        newInputProps.value = value
        return newInputProps
    }

    function getNewElems(id: string, value: BaseSupportedType): InputBaseProps[] {
        return elems.map(v => updateIndividualElement(v, id, value))
    }

    function submitNewValue(newElems: InputBaseProps[]): void {
        const newValue: BaseSupportedType[] = newElems.map(v => v.value)
        props.updateValue(newValue)
    }

    // TODO: update type definitions to only support BaseSupportedType?
    const updateValueElem: (id: string) => UpdateValueFunc = (id: string) => ((value: BaseSupportedType) => {
        const newElems = getNewElems(id, value)
        setElems(newElems)
        submitNewValue(newElems)
    })

    const handleClick = () => {
        const newElement = createDefault(props.elemType, updateValueElem, props.enumValues)
        newElement.shouldAnimate = true

        const newElements = [...elems, newElement]
        setElems(newElements);
        submitNewValue(newElements)
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

export type BaseSupportedType =
    | number
    | boolean
    | string
    | ({ filepath: string } | null)

export type SupportedType =
    | BaseSupportedType
    | BaseSupportedType[]

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