import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { activeFileAtom } from '../../store/atoms/files';
import { loadableCurrTasks } from '../../store/atoms/tasks';
import { TaskType } from '../../types/Task';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type FileViewProps = {};

const FileView: FunctionalComponent<FileViewProps> = () => {
	const activeFile = useAtomValue(activeFileAtom);
	const activeFileTasks = useAtomValue(loadableCurrTasks);
	const [tasks, setTasks] = useState<TaskType[]>([]);

	useEffect(() => {
		if (activeFileTasks.state === 'hasData') {
			setTasks(activeFileTasks.data);
		}
	}, [activeFileTasks]);

	return (
		<BaseView title={activeFile?.name ?? ''}>
			<TaskList tasks={tasks} />
		</BaseView>
	);
};

export default FileView;
