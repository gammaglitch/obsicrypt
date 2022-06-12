import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useFileManager } from '../FileManager';
import FileOverview from './FileOverview';

type ReactViewProps = {
	obsidian: Plugin;
};

export const ReactView: FunctionalComponent<ReactViewProps> = ({
	obsidian,
}) => {
	const { files, toggleTaskStatus, loadTasksFromVault } = useFileManager(obsidian);

	return (
		<div className="border p-4 border-green-500">
			<button className='border bg-blue-500 hover:bg-blue-300' onClick={() => loadTasksFromVault()}>Please refresh uWu</button>
			<div>
				<FileOverview files={files} toggleTask={toggleTaskStatus} />
			</div>
		</div>
	);
};
