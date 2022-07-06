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
	const onUpdateText = (task: TaskType, text: string) => {
		updateText(task, text);
	};

	return (
		<div className="w-full">
			{tasks.map((task, index) => {
				return (
					<Task
						key={`${task.filePath}-${index}`}
						task={task}
						updateText={(text) => onUpdateText(task, text)}
					/>
				);
			})}
		</div>
	);
};

export default TaskList;
