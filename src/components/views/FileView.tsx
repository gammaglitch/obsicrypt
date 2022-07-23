import { FunctionalComponent } from 'preact';
import { useFileManager } from '../../hooks/useFileManager';
import useStore, { useDerivedState } from '../../store/store';
import { TaskType } from '../../types/Task';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type FileViewProps = {};

const FileView: FunctionalComponent<FileViewProps> = () => {
	const { selectedFile } = useStore();
	const { selectedFilesTasks } = useDerivedState();
	const { updateTask } = useFileManager();

	const onUpdateText = (task: TaskType, text: string) => {
		updateTask(task, text);
	};

	return (
		<BaseView title={selectedFile.path}>
			<TaskList tasks={selectedFilesTasks} />
		</BaseView>
	);
};

export default FileView;
