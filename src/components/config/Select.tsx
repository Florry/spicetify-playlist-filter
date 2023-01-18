import React, { useEffect } from "react";

interface Props {
	value: string;
	options: { label: string; value: string }[];
	setValue: (value: string) => void;
}

const Select = ({ value, setValue, options }: Props) => {
	const [inputValue, setInputValue] = React.useState(value);

	useEffect(() => setInputValue(value), [value]);

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newValue = e.target.value;

		console.log("Select: ", newValue);

		setInputValue(newValue);
		setValue(newValue);
	};

	return (
		<select
			className="main-dropDown-dropDown"
			value={inputValue}
			onChange={onChange}
		>
			{options.map(option => <option value={option.value}>{option.label}</option>)}
		</select>
	);
};

export default Select;