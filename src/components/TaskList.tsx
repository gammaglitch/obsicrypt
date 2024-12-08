import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Taskey } from '../helpers/tasks/types';
import { useFileManager } from '../hooks/useFileManager';
import Task from './Task';
import TaskModal from './TaskModal';

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

	const handleAddTask = async () => {
		const text = newTaskText.trim();
		if (!text || !targetFilePath) return;
		await addTaskToFile(targetFilePath, text);
		setNewTaskText('');
	};

	return (
		<div className="w-full">
			{tasks.map((task, index) => {
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
