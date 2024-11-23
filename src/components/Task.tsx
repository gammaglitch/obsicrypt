import { FunctionalComponent } from 'preact';

import { Taskey } from '../helpers/tasks/types';
import Checkbox from './Checkbox';

type TaskProps = {
	task: Taskey;
	check: (value: boolean) => void;
	onClick: () => void;
};

const Task: FunctionalComponent<TaskProps> = ({ task, check, onClick }) => {
	return (
		<div>
			<div className="flex items-center">
				<Checkbox
					active={task.done}
					onClick={(e) => {
						e.stopPropagation();
						check(!task.done);
					}}
				/>
				<div
					className={`w-full text-ellipsis overflow-hidden cursor-pointer ${
						task.done ? 'text-task-text-completed' : ''
					}`}
					onClick={onClick}
				>
					{task.displayText}
				</div>
			</div>
		</div>
	);
};

export default Task;
