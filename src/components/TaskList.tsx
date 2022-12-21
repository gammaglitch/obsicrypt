import { FunctionalComponent } from 'preact';

import { useFileManager } from '../hooks/useFileManager';
import { TaskType } from '../types/Task';
import Task from './Task';

type TaskListProps = {
	tasks: TaskType[];
};

const TaskList: FunctionalComponent<TaskListProps> = ({ tasks }) => {
	const { updateTask, toggleTaskStatus } = useFileManager();

	const onUpdateText = (task: TaskType, text: string) => {
		updateTask(task, text);
	};

	return (
		<div className="w-full">
			{tasks.map((task, index) => {
				return (
					<Task
						key={`${task.filePath}-${index}`}
						task={task}
						updateText={(text) => onUpdateText(task, text)}
						toggle={() => toggleTaskStatus(task)}
					/>
				);
			})}
		</div>
	);
};

export default TaskList;
