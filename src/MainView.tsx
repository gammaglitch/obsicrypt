import { Plugin } from 'obsidian';
import { ComponentChild, FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { useFileManager } from './hooks/useFileManager';
import FileList from './components/FileList';
import useStore from './store/store';
import TaskList from './components/TaskList';
import { TaskType } from './types/Task';
import ViewSelector from './components/views/ViewSelector';
import { Views } from './types/Views';
import TodayView from './components/views/TodayView';
import FileView from './components/views/FileView';

type AvailableViews = Record<Views, ComponentChild>;

const test: AvailableViews = {
	TODAY: TodayView,
};

type MainView = {
	obsidian: Plugin;
};

export const MainView: FunctionalComponent<MainView> = ({ obsidian }) => {
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
		<div className="flex h-full p-2">
			<div className="w-1/4 h-full">
				<ViewSelector />
			</div>
			<div
				className="flex-1 px-2 py-1 border-t border-b border-r border-gray-800"
				style={{ backgroundColor: '#221F1E' }}
			>
				{selectedFile && <FileView />}
			</div>
		</div>
	);
};
