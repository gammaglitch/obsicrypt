import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { config } from '../../config';
import { StoredTask } from '../../helpers/tasks/types';
import { loadableInboxTasks } from '../../store/atoms/tasks';
import TaskList from '../TaskList';
import BaseView from './BaseView';

const inboxTargetFile = config.inboxPattern.includes('*')
	? undefined
	: config.inboxPattern;

type InboxViewProps = {};

const InboxView: FunctionalComponent<InboxViewProps> = () => {
	const inboxTasks = useAtomValue(loadableInboxTasks);
	const [tasks, setTasks] = useState<StoredTask[]>([]);

	useEffect(() => {
		if (inboxTasks.state === 'hasData') {
			setTasks(inboxTasks.data);
		}
	}, [inboxTasks]);

	return (
		<BaseView title="Inbox">
			<TaskList tasks={tasks} targetFilePath={inboxTargetFile} />
		</BaseView>
	);
};

export default InboxView;
