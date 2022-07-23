import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useDerivedState } from '../../store/store';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type TodayViewProps = {};

const TodayView: FunctionalComponent<TodayViewProps> = () => {
	const { filterTasksByDate, allTasks } = useDerivedState();
	const [tasks, setTasks] = useState(filterTasksByDate('2022-07-22'));

	return (
		<BaseView title="Today">
			<TaskList tasks={tasks} />
		</BaseView>
	);
};

export default TodayView;
