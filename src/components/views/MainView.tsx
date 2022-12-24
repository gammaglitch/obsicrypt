import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { ComponentChild, FunctionalComponent } from 'preact';

import { activeFileAtom, loadableAllDataAtom } from '../../store/atoms/files';
import { viewAtom } from '../../store/atoms/view';
import { FileType } from '../../types/File';
import { Views } from '../../types/Views';
import { ViewWrapperProps } from '../../ViewWrapper';
import FileList from '../FileList';
import FileView from './FileView';
import TodayView from './TodayView';

type AvailableViews = Record<Views, ComponentChild>;

const AllViews: AvailableViews = {
	TODAY: <TodayView />,
	FILE: <FileView />,
};

export const MainView: FunctionalComponent<ViewWrapperProps> = ({
	obsidian,
}) => {
	const data = useAtomValue(loadableAllDataAtom);
	const [view, setView] = useAtom(viewAtom);
	const [file, setFile] = useAtom(activeFileAtom);

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
		}
		return <div>no active view</div>;
	};

	return (
		<div className="flex w-full h-full">
			<div
				className="flex-shrink-0 w-1/3 px-4 pt-4"
				style={{ backgroundColor: '#201B27' }}
			>
				{/* <ViewSelector view={view} onSelectView={selectView} /> */}

				{data.state === 'hasData' && (
					<FileList
						files={data.data.files}
						selectedFile={file}
						onSelectFile={selectFile}
					/>
				)}
			</div>

			<div
				className="flex-1 w-2/3 px-4 pt-8"
				style={{ backgroundColor: '#292430' }}
			>
				{getView()}
			</div>
		</div>
	);
};
