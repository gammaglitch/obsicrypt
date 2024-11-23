import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { Taskey } from '../../helpers/tasks/types';
import { activeDirectoryAtom } from '../../store/atoms/files';
import { loadableDirectoryTasks } from '../../store/atoms/tasks';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type DirectoryViewProps = {};

const DirectoryView: FunctionalComponent<DirectoryViewProps> = () => {
	const activeDirectory = useAtomValue(activeDirectoryAtom);
	const activeDirectoryTasks = useAtomValue(loadableDirectoryTasks);
	const [tasks, setTasks] = useState<Taskey[]>([]);

	useEffect(() => {
		if (activeDirectoryTasks.state === 'hasData') {
			setTasks(activeDirectoryTasks.data);
		}
	}, [activeDirectoryTasks]);

	const dirName = activeDirectory
		? activeDirectory.substring(activeDirectory.lastIndexOf('/') + 1)
		: '';

	return (
		<BaseView title={dirName}>
			<TaskList tasks={tasks} />
		</BaseView>
	);
};

export default DirectoryView;
