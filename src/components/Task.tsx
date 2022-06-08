import type { TaskType } from '../types/Task';

type TaskProps = { task: TaskType };

const Task = ({ task: { status, text } }: TaskProps) => {
	return (
		<div className="bg-white">
			<div>{status}</div>
			<div>{text}</div>
		</div>
	);
};

export default Task;
