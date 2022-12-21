import { FunctionalComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { useFileManager } from '../hooks/useFileManager';
import { useTaskManager } from '../hooks/useTaskUpdater';
import type { TaskType } from '../types/Task';
import Checkbox from './Checkbox';

type TaskProps = {
	task: TaskType;
	updateText: (text: string) => void;
	toggle: () => void;
};

const Task: FunctionalComponent<TaskProps> = ({ task, updateText }) => {
	const ref = useRef();
	const [text, setText] = useState(task.text);
	const [showDetails, setShowDetails] = useState(false);

	const { toggleTaskStatus } = useFileManager();
	const { updateDate } = useTaskManager();

	const [isActive, setIsActive] = useState(false);

	const taskClasses =
		'rounded transition-spacing duration-250 text-white mb-2 flex flex-col py-1 px-2 w-full';

	return (
		<div>
			<div className="flex items-center">
				<Checkbox
					active={task.isComplete}
					onClick={() => toggleTaskStatus(task)}
				/>
				<div
					className={`w-full text-ellipsis overflow-hidden ${
						task.isComplete ? 'text-task-text-completed' : ''
					}`}
				>
					{text}
				</div>
			</div>
		</div>
	);
};

export default Task;
