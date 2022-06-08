import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useFileManager } from '../FileManager';
import FileOverview from './FileOverview';
import '../style/index.css';

type ReactViewProps = {
	obsidian: Plugin;
};

export const ReactView: FunctionalComponent<ReactViewProps> = ({
	obsidian,
}) => {
	const { files, toggleTaskStatus } = useFileManager(obsidian);

	return (
		<div id="my-plugin-view">
			<h4>Hello, Vite?!</h4>
			<div>
				<FileOverview files={files} />
			</div>
		</div>
	);
};
