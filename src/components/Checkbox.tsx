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
	return (
		<div
			className={`flex-shrink-0 w-4 h-4 mr-2 rounded-full cursor-pointer flex items-center justify-center border ${
				active
					? 'border-task-checkbox-background bg-task-checkbox-background'
					: 'border-task-checkbox-border'
			}`}
			style={
				color
					? { borderColor: color, backgroundColor: active ? color : undefined }
					: undefined
			}
			onClick={onClick}
		>
			{active && (
				<svg
					className="w-2.5 h-2.5"
					viewBox="0 0 12 12"
					fill="none"
					stroke="white"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M2 6l3 3 5-5" />
				</svg>
			)}
		</div>
	);
};

export default Checkbox;
