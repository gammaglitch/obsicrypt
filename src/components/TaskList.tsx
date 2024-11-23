import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Taskey } from '../helpers/tasks/types';
import { useFileManager } from '../hooks/useFileManager';
import Task from './Task';
import TaskModal from './TaskModal';

type TaskListProps = {
	tasks: Taskey[];
};

const TaskList: FunctionalComponent<TaskListProps> = ({ tasks }) => {
	const { toggleTaskStatus } = useFileManager();
	const [selectedTask, setSelectedTask] = useState<Taskey | null>(null);

	return (
		<div className="w-full">
			{tasks.map((task, index) => {
				return (
					<Task
						key={index}
						task={task}
						check={() => toggleTaskStatus(task)}
						onOpenModal={() => setSelectedTask(task)}
					/>
				);
			})}

			<TaskModal
				task={selectedTask!}
				isOpen={selectedTask !== null}
				onClose={() => setSelectedTask(null)}
			/>
		</div>
	);
};

export default TaskList;
