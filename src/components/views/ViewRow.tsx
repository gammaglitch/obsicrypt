import { ComponentChildren, FunctionalComponent } from 'preact';

type ViewRowProps = {
	active: boolean;
	icon?: ComponentChildren;
	label: string;
	onClick: () => void;
};

const ViewRow: FunctionalComponent<ViewRowProps> = ({
	active,
	icon,
	label,
	onClick,
}) => {
	return (
		<div
			onClick={onClick}
			className={`flex items-center px-2 rounded ${
				active ? 'bg-task-active-background' : ''
			}`}
			style={{ color: '#C4C3C7' }}
		>
			{icon ? icon : ''} {label}
		</div>
	);
};

export default ViewRow;
