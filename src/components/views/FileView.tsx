import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { StoredTask } from '../../helpers/tasks/types';
import { activeFileAtom } from '../../store/atoms/files';
import { loadableCurrTasks } from '../../store/atoms/tasks';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type FileViewProps = {};

const FileView: FunctionalComponent<FileViewProps> = () => {
	const activeFile = useAtomValue(activeFileAtom);
	const activeFileTasks = useAtomValue(loadableCurrTasks);
	const [tasks, setTasks] = useState<StoredTask[]>([]);

	useEffect(() => {
		if (activeFileTasks.state === 'hasData') {
			setTasks(activeFileTasks.data);
		}
	}, [activeFileTasks]);

	console.log(activeFile);

	return (
		<BaseView title={activeFile?.name ?? ''}>
			<TaskList tasks={tasks} targetFilePath={activeFile?.path} />
		</BaseView>
	);
};

export default FileView;
