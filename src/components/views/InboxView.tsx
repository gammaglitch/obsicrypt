import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { Taskey } from '../../helpers/tasks/types';
import { loadableInboxTasks } from '../../store/atoms/tasks';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type InboxViewProps = {};

const InboxView: FunctionalComponent<InboxViewProps> = () => {
	const inboxTasks = useAtomValue(loadableInboxTasks);
	const [tasks, setTasks] = useState<Taskey[]>([]);

	useEffect(() => {
		if (inboxTasks.state === 'hasData') {
			setTasks(inboxTasks.data);
		}
	}, [inboxTasks]);

	return (
		<BaseView title="Inbox">
			<TaskList tasks={tasks} />
		</BaseView>
	);
};

export default InboxView;
