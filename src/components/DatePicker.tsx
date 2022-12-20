import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import * as chrono from 'chrono-node';

type DatePickerProps = {
	onUpdateDate: (date: string) => void;
};

const DatePicker: FunctionalComponent<DatePickerProps> = ({ onUpdateDate }) => {
	const [value, setValue] = useState('');

	const onChangeHandler = (event: any) => {
		setValue(event.target.value);
	};

	const handleKeyDown = (event: any) => {
		if (event.keyCode === 13) {
			onUpdateDate(value);
		}
	};

	return (
		<div>
			<input
				type="text"
				value={value}
				onChange={onChangeHandler}
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
};

export default DatePicker;
