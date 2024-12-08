import { FunctionalComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { today } from '../helpers/dates';
import { Taskey } from '../helpers/tasks/types';
import Checkbox from './Checkbox';

const priorityColors: Record<string, string> = {
	'1': '#F87171',
	'2': '#FB923C',
	'3': '#60A5FA',
};

const priorityOptions = ['1', '2', '3', '4'];

type TaskProps = {
	task: Taskey;
	check: (value: boolean) => void;
	onDateChange: (date: string) => void;
	onPriorityChange: (priority: string) => void;
	onOpenModal: () => void;
	highlightOverdue?: boolean;
};

const Task: FunctionalComponent<TaskProps> = ({
	task,
	check,
	onDateChange,
	onPriorityChange,
	onOpenModal,
	highlightOverdue = false,
}) => {
	const [hovered, setHovered] = useState(false);
	const [priorityOpen, setPriorityOpen] = useState(false);
	const dateInputRef = useRef<HTMLInputElement>(null);

	const currentPriority = task.custom?.priority?.[0];

	const openDatePicker = () => {
		dateInputRef.current?.showPicker();
	};

	return (
		<div
			className={`relative flex items-center rounded px-2 py-1 ${
				hovered ? 'bg-task-active-background' : ''
			}`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => {
				setHovered(false);
				setPriorityOpen(false);
			}}
		>
			<Checkbox
				active={task.done}
				color={priorityColors[currentPriority]}
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
					className={`flex-shrink-0 ml-2 text-xs cursor-pointer hover:opacity-80 ${
						highlightOverdue && task.due < today()
							? 'text-task-overdue'
							: 'opacity-50'
					}`}
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
				<div className="relative flex-shrink-0 ml-2">
					<div
						className="cursor-pointer opacity-60 hover:opacity-100 text-xs"
						onClick={() => setPriorityOpen(!priorityOpen)}
					>
						{currentPriority ? `p${currentPriority}` : '+ p'}
					</div>
					{priorityOpen && (
						<div
							className="absolute right-0 top-full mt-1 rounded shadow-lg z-50 flex flex-col"
							style={{ backgroundColor: '#312E37' }}
						>
							{priorityOptions.map((p) => (
								<div
									key={p}
									className="px-3 py-1 cursor-pointer hover:opacity-80 text-xs whitespace-nowrap"
									style={{ color: priorityColors[p] ?? '#9CA3AF' }}
									onClick={() => {
										onPriorityChange(p);
										setPriorityOpen(false);
									}}
								>
									p{p}
								</div>
							))}
						</div>
					)}
				</div>
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
