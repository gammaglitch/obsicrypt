import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useFileManager } from '../../hooks/useFileManager';
import { activeFileAtom } from '../../store/atoms/files';
import { activeFileTasks, activeFileTasksAtom } from '../../store/atoms/tasks';
import useStore, { useDerivedState } from '../../store/store';
import { TaskType } from '../../types/Task';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type FileViewProps = {};

const FileView: FunctionalComponent<FileViewProps> = () => {
	const activeFile = useAtomValue(activeFileAtom);
	const activeFileTasks = useAtomValue(activeFileTasksAtom);
	const { selectedFile } = useStore();
	const { selectedFilesTasks } = useDerivedState();
	const { updateTask } = useFileManager();

	const onUpdateText = (task: TaskType, text: string) => {
		updateTask(task, text);
	};

	if (activeFile) {
		return (
			<BaseView title={activeFile.path}>
				<TaskList tasks={activeFileTasks} />
			</BaseView>
		);
	} else {
		return <div>no file selected</div>;
	}
};

export default FileView;
