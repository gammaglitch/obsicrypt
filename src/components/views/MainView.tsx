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
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import {
	activeFileAtom,
	loadableFiles,
	obsidianAtom,
} from '../../store/atoms/files';
import { loadableTasks, tasksAtom } from '../../store/atoms/tasks';
import { viewAtom } from '../../store/atoms/view';
import { useAtom } from 'jotai';
import FileList from '../FileList';
import { FileType } from '../../types/File';

type AvailableViews = Record<Views, ComponentChild>;

const AllViews: AvailableViews = {
	TODAY: <TodayView />,
	FILE: <FileView />,
};

export const MainView: FunctionalComponent<ViewWrapperProps> = ({
	obsidian,
}) => {
	const { status } = useStore();
	const files = useAtomValue(loadableFiles);
	const tasks = useAtomValue(loadableTasks);
	const setObsidian = useUpdateAtom(obsidianAtom);
	const [view, setView] = useAtom(viewAtom);
	const [file, setFile] = useAtom(activeFileAtom);

	useEffect(() => {
		setObsidian(obsidian);
	}, []);

	const selectFile = (file: FileType) => {
		setView(Views.FILE);
		setFile(file);
	};

	const selectView = (view: Views) => {
		setView(view);
		setFile(null);
	};

	const getView = () => {
		if (view) {
			return AllViews[view];
		} else {
			return <div>no active view</div>;
		}
	};

	return (
		<div className="flex w-full h-full">
			<div className="flex-shrink-0 w-1/4 bg-gray-800">
				<ViewSelector view={view} onSelectView={selectView} />

				<div>
					<h1>Files</h1>
					<div className="pl-2">
						{files.state === 'hasData' && (
							<>
								<FileList
									files={files.data}
									selectedFile={file}
									onSelectFile={selectFile}
								/>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="flex-1 w-3/4">{status === Status.READY && getView()}</div>
		</div>
	);
};
