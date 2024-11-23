import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Taskey } from '../helpers/tasks/types';
import Checkbox from './Checkbox';

type TaskProps = {
	task: Taskey;
	check: (value: boolean) => void;
	onOpenModal: () => void;
};

const Task: FunctionalComponent<TaskProps> = ({ task, check, onOpenModal }) => {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			className={`flex items-center rounded px-1 ${
				hovered ? 'bg-task-active-background' : ''
			}`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Checkbox
				active={task.done}
				onClick={(e) => {
					e.stopPropagation();
					check(!task.done);
				}}
			/>
			<div
				className={`flex-1 text-ellipsis overflow-hidden ${
					task.done ? 'text-task-text-completed' : ''
				}`}
			>
				{task.displayText}
			</div>
			{hovered && (
				<div
					className="flex-shrink-0 ml-2 cursor-pointer opacity-60 hover:opacity-100"
					onClick={onOpenModal}
				>
					...
				</div>
			)}
		</div>
	);
};

export default Task;
