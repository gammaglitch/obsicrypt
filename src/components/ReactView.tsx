import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';
import type { File, Task } from '../FileManager';
import { useFileManager } from '../FileManager';

type ReactViewProps = {
	obsidian: Plugin;
};

type TaskProps = {
	tasks: Task[];
};

const Tasks = ({ tasks }: TaskProps) => {
	return (
		<div>
			{tasks.map((t) => (
				<div>{t.text}</div>
			))}
		</div>
	);
};

type FileProps = {
	file: File;
	toggleTask: (file: File) => void;
};

const FileElement = ({ file, toggleTask }: FileProps) => {
	return (
		<div>
			<h1>{file.name}</h1>
			<div onClick={() => toggleTask(file)}>
				<Tasks tasks={file.tasks} />
			</div>
		</div>
	);
};

export const ReactView: FunctionalComponent<ReactViewProps> = ({
	obsidian,
}) => {
	const { files, toggleTaskStatus } = useFileManager(obsidian);

	return (
		<div>
			<h4>Hello, Vite?!</h4>
			<div>
				{files.map((file) => (
					<FileElement file={file} toggleTask={toggleTaskStatus} />
				))}
			</div>
		</div>
	);
};
