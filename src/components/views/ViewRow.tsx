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
			className={`flex items-center p-1 rounded ${active ? 'bg-blue-600' : ''}`}
		>
			{icon ? icon : ''} {label}
		</div>
	);
};

export default ViewRow;
