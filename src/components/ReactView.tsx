import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
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
	const { toggleTaskStatus, updateTask } = useFileManager();
	const {
		files,
		tasks,
		selectedFile,
		setObsidian,
		selectFile,
		selectedFilesTasks,
	} = useStore();
	const [activeFile, setActiveFile] = useState(null);

	const onUpdateText = (task: TaskType, text: string) => {
		updateTask(task, text);
	};

	useEffect(() => {
		setObsidian(obsidian);
	});

	return (
		<div className="flex p-2">
			<div className="p-2 border-r border-gray-600">
				<div className="mb-8">
					<div className="border-b border-gray-600">Filter</div>
					<button onClick={() => selectFile(null)}>All</button>
				</div>

				<div>
					<div className="border-b border-gray-600">Files</div>
					{files.length > 0 && (
						<FileList files={files} selectFile={() => null} />
					)}
				</div>
			</div>
			<div>
				{tasks.length > 0 && (
					<TaskList
						tasks={selectedFile ? selectedFilesTasks() : tasks}
						updateText={onUpdateText}
					/>
				)}
			</div>
		</div>
	);
};
