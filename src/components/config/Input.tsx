import React, { useEffect } from "react";
import { InputOptions } from "../../config/Config";

interface Props {
    value: string;
    setValue: (value: string) => void;
    options?: InputOptions;
}

const Input = ({ value, setValue, options }: Props) => {
    const [inputValue, setInputValue] = React.useState(value);

    useEffect(() => setInputValue(value), [value]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (options?.maxLength) {
            if (newValue.length > options.maxLength) {
                return;
            }
        }

        setInputValue(newValue);
        setValue(newValue);
    };

    return (
        <input
            className="x-settings-input"
            value={inputValue}
            onChange={onChange}
        />
    );
};

export default Input;