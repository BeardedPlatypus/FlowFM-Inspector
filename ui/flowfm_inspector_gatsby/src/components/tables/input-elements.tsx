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
