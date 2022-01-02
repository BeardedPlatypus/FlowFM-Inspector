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

