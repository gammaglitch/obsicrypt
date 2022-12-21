import { FunctionalComponent } from 'preact';

type CheckboxProps = {
	active: boolean;
	onClick: () => void;
};

const Checkbox: FunctionalComponent<CheckboxProps> = ({ active, onClick }) => {
	const classes = active
		? 'border border-task-checkbox-background bg-task-checkbox-background'
		: 'border border-task-checkbox-border';

	return (
		<div
			className={`flex-shrink-0 w-3 h-3 mr-2 border rounded cursor-pointer ${classes}`}
			onClick={onClick}
		/>
	);
};

export default Checkbox;
