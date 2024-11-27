import { FunctionalComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { Taskey } from '../helpers/tasks/types';
import Checkbox from './Checkbox';

type TaskProps = {
	task: Taskey;
	check: (value: boolean) => void;
	onDateChange: (date: string) => void;
	onOpenModal: () => void;
};

const Task: FunctionalComponent<TaskProps> = ({
	task,
	check,
	onDateChange,
	onOpenModal,
}) => {
	const [hovered, setHovered] = useState(false);
	const dateInputRef = useRef<HTMLInputElement>(null);

	const openDatePicker = () => {
		dateInputRef.current?.showPicker();
	};

	return (
		<div
			className={`flex items-center rounded px-2 py-1 ${
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
			<input
				ref={dateInputRef}
				type="date"
				className="absolute opacity-0 pointer-events-none"
				value={task.due ?? ''}
				onChange={(e) => {
					const value = (e.target as HTMLInputElement).value;
					if (value) onDateChange(value);
				}}
			/>
			{task.due ? (
				<div
					className="flex-shrink-0 ml-2 text-xs opacity-50 cursor-pointer hover:opacity-80"
					onClick={openDatePicker}
				>
					{task.due}
				</div>
			) : (
				hovered && (
					<div
						className="flex-shrink-0 ml-2 text-xs opacity-40 cursor-pointer hover:opacity-70"
						onClick={openDatePicker}
					>
						+ date
					</div>
				)
			)}
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
