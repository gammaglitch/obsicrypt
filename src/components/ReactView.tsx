import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { useFileManager } from '../FileManager';
import FileOverview from './FileOverview';
import FileList from './FileList';
import useStore from '../store/store';

type ReactViewProps = {
	obsidian: Plugin;
};

export const ReactView: FunctionalComponent<ReactViewProps> = ({
	obsidian,
}) => {
	const { toggleTaskStatus, loadTasksFromVault } = useFileManager(obsidian);
	const { files } = useStore();
	const [activeFile, setActiveFile] = useState(null);

	return (
		<div className="border p-4 border-green-500">
			<button
				className="border bg-blue-500 hover:bg-blue-300"
				onClick={() => loadTasksFromVault()}
			>
				Please refresh uWu
			</button>
			<div>
				<FileList files={files} selectFile={(file) => setActiveFile(file)} />
			</div>
			<div>
				<FileOverview files={files} toggleTask={toggleTaskStatus} />
			</div>
		</div>
	);
};
