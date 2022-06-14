import type { TaskType } from '../types/Task';

type TaskProps = {
	task: TaskType;
	toggleTask: (task: TaskType) => void;
};

const Task = ({ task, toggleTask }: TaskProps) => {
	const { status, text } = task;

	const onToggleTask = () => {
		toggleTask(task);
	};

	return (
		<div className="bg-slate-500 flex" onClick={onToggleTask}>
			<div>{text}</div>
		</div>
	);
};

export default Task;
