import { FunctionalComponent } from 'preact';
import { useFileManager } from '../../hooks/useFileManager';
import useStore from '../../store/store';
import { TaskType } from '../../types/Task';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type FileViewProps = {};

const FileView: FunctionalComponent<FileViewProps> = () => {
	const { selectedFile, selectedFilesTasks } = useStore();
	const { toggleTaskStatus, updateTask } = useFileManager();

	const onUpdateText = (task: TaskType, text: string) => {
		updateTask(task, text);
	};

	return (
		<BaseView title={selectedFile.path}>
			<TaskList tasks={selectedFilesTasks()} updateText={onUpdateText} />
		</BaseView>
	);
};

export default FileView;
