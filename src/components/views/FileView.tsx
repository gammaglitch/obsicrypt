import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useFileManager } from '../../hooks/useFileManager';
import { activeFileAtom } from '../../store/atoms/files';
import {
	activeFileTasksAtom,
	loadableCurrTasks,
} from '../../store/atoms/tasks';
import { TaskType } from '../../types/Task';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type FileViewProps = {};

const FileView: FunctionalComponent<FileViewProps> = () => {
	const activeFile = useAtomValue(activeFileAtom);
	const activeFileTasks = useAtomValue(loadableCurrTasks);

	if (activeFile && activeFileTasks.state === 'hasData') {
		return (
			<BaseView title={activeFile.name}>
				<TaskList tasks={activeFileTasks.data} />
			</BaseView>
		);
	} else {
		return <div>no file selected</div>;
	}
};

export default FileView;
