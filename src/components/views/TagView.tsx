import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { Taskey } from '../../helpers/tasks/types';
import { activeTagAtom } from '../../store/atoms/files';
import { loadableTagTasks } from '../../store/atoms/tasks';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type TagViewProps = {};

const TagView: FunctionalComponent<TagViewProps> = () => {
	const activeTag = useAtomValue(activeTagAtom);
	const activeTagTasks = useAtomValue(loadableTagTasks);
	const [tasks, setTasks] = useState<Taskey[]>([]);

	useEffect(() => {
		if (activeTagTasks.state === 'hasData') {
			setTasks(activeTagTasks.data);
		}
	}, [activeTagTasks]);

	return (
		<BaseView title={activeTag ? `#${activeTag}` : ''}>
			<TaskList tasks={tasks} />
		</BaseView>
	);
};

export default TagView;
