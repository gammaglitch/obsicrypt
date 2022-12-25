import { FunctionalComponent } from 'preact';

import Checkbox from './Checkbox';

type TaskProps = {
	text: string;
	done: boolean;
	check: (value: boolean) => void;
};

const Task: FunctionalComponent<TaskProps> = ({ text, done, check }) => {
	return (
		<div>
			<div className="flex items-center">
				<Checkbox active={done} onClick={() => check(!done)} />
				<div
					className={`w-full text-ellipsis overflow-hidden ${
						done ? 'text-task-text-completed' : ''
					}`}
				>
					{text}
				</div>
			</div>
		</div>
	);
};

export default Task;
