import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { useFileManager } from '../FileManager';

import { TaskType } from '../types/Task';

type TaskProps = {
	task: TaskType;
	isActive: boolean;
	onClick: () => void;
	updateText: (text: string) => void;
};

const Task: FunctionalComponent<TaskProps> = ({
	task,
	isActive,
	onClick,
	updateText,
}) => {
	const [text, setText] = useState(task.text);

	return (
		<div
			className={`${isActive ? 'bg-blue-600' : ''} p-1 rounded`}
			onClick={onClick}
		>
			{isActive ? (
				<div className="flex">
					<input
						type="text"
						value={text}
						onChange={(e: any) => setText(e.target.value)}
						autoFocus
					/>
					<button className="bg-green-600" onClick={() => updateText(text)}>
						Save
					</button>
				</div>
			) : (
				<span>{text}</span>
			)}
		</div>
	);
};

type TaskListProps = {
	tasks: TaskType[];
	updateText: (task: TaskType, text: string) => void;
};

const TaskList: FunctionalComponent<TaskListProps> = ({
	tasks,
	updateText,
}) => {
	const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(
		null
	);

	const onUpdateText = (task: TaskType, text: string) => {
		updateText(task, text);
	};

	return (
		<div>
			{tasks.map((task, index) => {
				const isActive = index === selectedTaskIndex;

				return (
					<Task
						key={index}
						task={task}
						isActive={isActive}
						onClick={() => setSelectedTaskIndex(index)}
						updateText={(text) => onUpdateText(task, text)}
					/>
				);
			})}
		</div>
	);
};

export default TaskList;
