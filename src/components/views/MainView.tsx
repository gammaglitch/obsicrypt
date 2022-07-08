import { Plugin } from 'obsidian';
import { ComponentChild, FunctionalComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import useStore, { useDerivedState } from '../../store/store';

import { Views } from '../../types/Views';
import TodayView from './TodayView';
import FileView from './FileView';
import { ViewWrapperProps } from '../../ViewWrapper';
import ViewSelector from './ViewSelector';
import { Status } from '../../types/Status';

type AvailableViews = Record<Views, ComponentChild>;

const AllViews: AvailableViews = {
	TODAY: <TodayView />,
	FILE: <FileView />,
};

export const MainView: FunctionalComponent<ViewWrapperProps> = ({
	obsidian,
}) => {
	const { status, selectedView, files, setObsidian } = useStore();
	const tasks = useDerivedState();

	useEffect(() => {
		setObsidian(obsidian);
	}, []);

	const getView = () => {
		if (selectedView) {
			return AllViews[selectedView];
		} else {
			return <div>no active view</div>;
		}
	};

	return (
		<div className="flex w-full h-full">
			<div className="flex-shrink-0 w-1/4">
				<ViewSelector />
			</div>

			<div className="flex-1 w-3/4">{status === Status.READY && getView()}</div>
		</div>
	);
};
