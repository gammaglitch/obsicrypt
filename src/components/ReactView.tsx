import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { useFileManager } from '../FileManager';
import FileOverview from './FileOverview';
import FileList from './FileList';
import useStore from '../store/store';
import TaskList from './TaskList';
import { TaskType } from '../types/Task';

type ReactViewProps = {
	obsidian: Plugin;
};

export const ReactView: FunctionalComponent<ReactViewProps> = ({
	obsidian,
}) => {
	const { toggleTaskStatus, updateTask } = useFileManager(obsidian);
	const { files, tasks } = useStore();
	const [activeFile, setActiveFile] = useState(null);

	const onUpdateText = (task: TaskType, text: string) => {
		updateTask(task, text);
	};

	return (
		<div className="p-4 border border-green-500">
			<div>
				{tasks.length > 0 && (
					<TaskList tasks={tasks} updateText={onUpdateText} />
				)}
			</div>
		</div>
	);
};
