import { FunctionalComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import DatePicker from './DatePicker';
import type { TaskType } from '../types/Task';
import { useFileManager } from '../FileManager';
import IconToggle from './IconToggle';
import Checkbox from './Checkbox';
import useOnClickOutside from '../hooks/useOnClickOutside';

type TaskProps = {
	task: TaskType;
	updateText: (text: string) => void;
};

const Task: FunctionalComponent<TaskProps> = ({ task, updateText }) => {
	const ref = useRef();
	const [text, setText] = useState(task.text);
	const [showDetails, setShowDetails] = useState(false);

	const { updateDate, updateTask, toggleTaskStatus } = useFileManager();

	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		setText(task.text);
	}, [task.text]);

	const onClickHandler = () => {
		setIsActive(true);
	};

	const onDoubleClickHandler = () => {
		setShowDetails(true);
	};

	const updateDateHandler = (date: string) => {
		updateDate(task, date);
	};

	const updateTextHandler = () => {
		updateTask(task, text);
	};

	useOnClickOutside(ref, () => {
		setIsActive(false);
		setShowDetails(false);

		if (task.text !== text) {
			updateTextHandler();
		}
	});

	const activeClasses = 'bg-task-active-background';
	const detailClasses = 'h-20 border shadow-md bg-gray-800';
	const defaultClasses = '';

	const taskClasses =
		'rounded transition-spacing duration-250 text-white mb-2 flex flex-col py-1 px-2 w-full';

	return (
		<button
			className={`${taskClasses} ${
				isActive && !showDetails ? activeClasses : ''
			} ${showDetails ? detailClasses : ''}`}
			onClick={onClickHandler}
			onDblClick={onDoubleClickHandler}
			ref={ref}
		>
			<div className="flex items-center">
				<Checkbox
					active={task.isComplete}
					onClick={() => toggleTaskStatus(task)}
				/>
				<div>
					{showDetails ? (
						<input
							className="text-white bg-transparent border border-gray-500"
							value={text}
							onChange={(e: any) => setText(e.target.value)}
							autoFocus
						/>
					) : (
						text
					)}
				</div>
			</div>
		</button>
	);
};

export default Task;
