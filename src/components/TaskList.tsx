import { FunctionalComponent } from 'preact';

import { Taskey } from '../helpers/tasks/types';
import { useFileManager } from '../hooks/useFileManager';
import Task from './Task';

type TaskListProps = {
	tasks: Taskey[];
};

const TaskList: FunctionalComponent<TaskListProps> = ({ tasks }) => {
	const { toggleTaskStatus } = useFileManager();

	return (
		<div className="w-full">
			{tasks.map((task, index) => {
				return (
					<Task
						key={index}
						text={task.text}
						done={task.done}
						check={() => toggleTaskStatus(task)}
					/>
				);
			})}
		</div>
	);
};

export default TaskList;
