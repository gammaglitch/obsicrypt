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
	const { files, toggleTaskStatus } = useFileManager(obsidian);

	return (
		<div className="hover:bg-orange-500">
			<h4>Hello, Vite?!</h4>
			<div>
				<FileOverview files={files} toggleTask={toggleTaskStatus} />
			</div>
		</div>
	);
};
