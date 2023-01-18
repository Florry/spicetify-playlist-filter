import React, { useEffect } from "react";

interface Props {
	value: boolean;
	setValue: (value: boolean) => void;
}

const Checkbox = ({ value, setValue }: Props) => {
	const [inputValue, setInputValue] = React.useState(value);

	useEffect(() => setInputValue(value), [value]);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.checked;

		setInputValue(newValue);
		setValue(newValue);
	};

	return (
		<label className="x-toggle-wrapper">
			<input
				id="settings.showMusicAnnouncements"
				className="x-toggle-input"
				type="checkbox"
				checked={inputValue}
				onChange={onChange}
			/>
			<span className="x-toggle-indicatorWrapper">
				<span className="x-toggle-indicator" />
			</span>
		</label>
	);
};

export default Checkbox;