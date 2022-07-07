import { FunctionalComponent } from 'preact';
import BaseView from './BaseView';

type TodayViewProps = {};

const TodayView: FunctionalComponent<TodayViewProps> = () => {
	return (
		<BaseView title="Today">
			<div>Hi</div>
		</BaseView>
	);
};

export default TodayView;
