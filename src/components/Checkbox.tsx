import { FunctionalComponent } from 'preact';

type CheckboxProps = {
	active: boolean;
	color?: string;
	onClick: () => void;
};

const Checkbox: FunctionalComponent<CheckboxProps> = ({
	active,
	color,
	onClick,
}) => {
	const classes = active
		? 'border border-task-checkbox-background bg-task-checkbox-background'
		: 'border border-task-checkbox-border';

	return (
		<div
			className={`flex-shrink-0 w-3 h-3 mr-2 border rounded cursor-pointer ${classes}`}
			style={
				color
					? { borderColor: color, backgroundColor: active ? color : undefined }
					: undefined
			}
			onClick={onClick}
		/>
	);
};

export default Checkbox;
