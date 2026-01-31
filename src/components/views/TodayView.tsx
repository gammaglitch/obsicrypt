import { useAtomValue } from 'jotai';
import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { StoredTask } from '../../helpers/tasks/types';
import { loadableTodayTasks } from '../../store/atoms/tasks';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type TodayViewProps = {};

const TodayView: FunctionalComponent<TodayViewProps> = () => {
	const todayTasks = useAtomValue(loadableTodayTasks);
	const [tasks, setTasks] = useState<StoredTask[]>([]);

	useEffect(() => {
		if (todayTasks.state === 'hasData') {
			setTasks(todayTasks.data);
		}
	}, [todayTasks]);

	return (
		<BaseView title="Today">
			<TaskList tasks={tasks} highlightOverdue />
		</BaseView>
	);
};

export default TodayView;
