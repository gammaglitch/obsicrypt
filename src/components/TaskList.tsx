import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { useFileManager } from '../FileManager';

import { TaskType } from '../types/Task';
import Task from './Task';

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
						key={`${task.filePath}-${index}`}
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
