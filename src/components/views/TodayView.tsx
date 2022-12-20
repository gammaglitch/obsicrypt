import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import TaskList from '../TaskList';
import BaseView from './BaseView';

type TodayViewProps = {};

const TodayView: FunctionalComponent<TodayViewProps> = () => {
	const [tasks, setTasks] = useState([]);

	return (
		<BaseView title="Today">
			<TaskList tasks={tasks} />
		</BaseView>
	);
};

export default TodayView;
