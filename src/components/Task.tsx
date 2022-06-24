import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import DatePicker from './DatePicker';
import type { TaskType } from '../types/Task';

type TaskProps = {
	task: TaskType;
	isActive: boolean;
	onClick: () => void;
	updateText: (text: string) => void;
};

const Task: FunctionalComponent<TaskProps> = ({
	task,
	isActive,
	onClick,
	updateText,
}) => {
	const [text, setText] = useState(task.text);
	const [startDate, setStartDate] = useState(new Date());

	useEffect(() => {
		setText(task.text);
	}, [task.text]);

	const onClickHandler = () => {
		onClick();
	};

	return (
		<div
			className={`${
				isActive ? 'bg-task-active-background' : ''
			} p-1 rounded flex flex-col`}
			onClick={onClickHandler}
		>
			<div className="flex items-center text-sm">
				<div
					style={{ width: '12px', height: '12px' }}
					className={`${
						task.isComplete ? 'bg-blue-500' : ''
					} mr-2 border rounded border-task-checkbox-border`}
				></div>
				{/* <input
					type="text"
					value={text}
					onChange={(e: any) => setText(e.target.value)}
					style={{
						padding: 0,
						margin: 0,
						border: 'none',
						background: 'none',
					}}
					autoFocus
				/> */}
				<span>{text}</span>
			</div>
			{/* {isActive && (
				<div>
					<DatePicker />
				</div>
			)} */}
		</div>
	);
};

export default Task;
