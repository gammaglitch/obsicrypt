import { FunctionalComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { SortOption, sortTasks } from '../helpers/tasks/sort';
import { Taskey } from '../helpers/tasks/types';
import { useFileManager } from '../hooks/useFileManager';
import Task from './Task';
import TaskModal from './TaskModal';

const sortOptions: { value: SortOption; label: string }[] = [
	{ value: 'default', label: 'Default' },
	{ value: 'due', label: 'Due date' },
	{ value: 'priority', label: 'Priority' },
	{ value: 'name', label: 'Name' },
	{ value: 'status', label: 'Status' },
];

type TaskListProps = {
	tasks: Taskey[];
	targetFilePath?: string;
	highlightOverdue?: boolean;
};

const TaskList: FunctionalComponent<TaskListProps> = ({
	tasks,
	targetFilePath,
	highlightOverdue = false,
}) => {
	const {
		addTaskToFile,
		toggleTaskStatus,
		updateTaskeyDate,
		updateTaskeyMetadata,
	} = useFileManager();
	const [selectedTask, setSelectedTask] = useState<Taskey | null>(null);
	const [newTaskText, setNewTaskText] = useState('');
	const [sort, setSort] = useState<SortOption>('default');
	const [sortOpen, setSortOpen] = useState(false);

	const sortedTasks = useMemo(() => sortTasks(tasks, sort), [tasks, sort]);

	const handleAddTask = async () => {
		const text = newTaskText.trim();
		if (!text || !targetFilePath) return;
		await addTaskToFile(targetFilePath, text);
		setNewTaskText('');
	};

	return (
		<div className="w-full">
			<div className="flex justify-end mb-2 relative">
				<div
					className="text-xs cursor-pointer opacity-50 hover:opacity-80 select-none"
					onClick={() => setSortOpen(!sortOpen)}
				>
					Sort: {sortOptions.find((o) => o.value === sort)?.label}
				</div>
				{sortOpen && (
					<div className="absolute right-0 top-full mt-1 rounded shadow-lg z-50 flex flex-col bg-obsidian-bg-secondary">
						{sortOptions.map((option) => (
							<div
								key={option.value}
								className={`px-3 py-1 cursor-pointer text-xs whitespace-nowrap hover:bg-obsidian-bg-hover ${
									sort === option.value ? 'opacity-100' : 'opacity-60'
								}`}
								onClick={() => {
									setSort(option.value);
									setSortOpen(false);
								}}
							>
								{option.label}
							</div>
						))}
					</div>
				)}
			</div>

			{sortedTasks.map((task, index) => {
				return (
					<Task
						key={index}
						task={task}
						check={() => toggleTaskStatus(task)}
						onDateChange={(date) => updateTaskeyDate(task, date)}
						onPriorityChange={(p) => updateTaskeyMetadata(task, 'priority', p)}
						onOpenModal={() => setSelectedTask(task)}
						highlightOverdue={highlightOverdue}
					/>
				);
			})}

			{targetFilePath && (
				<div className="flex items-center rounded px-2 py-1 mt-1">
					<span className="flex-shrink-0 mr-2 opacity-40">+</span>
					<input
						type="text"
						className="flex-1 bg-transparent border-none outline-none opacity-60 focus:opacity-100"
						placeholder="Add task..."
						value={newTaskText}
						onInput={(e) =>
							setNewTaskText((e.target as HTMLInputElement).value)
						}
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleAddTask();
						}}
					/>
				</div>
			)}

			<TaskModal
				task={selectedTask!}
				isOpen={selectedTask !== null}
				onClose={() => setSelectedTask(null)}
			/>
		</div>
	);
};

export default TaskList;
