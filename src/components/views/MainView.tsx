import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { ComponentChild, FunctionalComponent } from 'preact';

import { activeFileAtom, activeTagAtom, allTagsAtom, loadableAllDataAtom } from '../../store/atoms/files';
import { viewAtom } from '../../store/atoms/view';
import { FileType } from '../../types/File';
import { Views } from '../../types/Views';
import { ViewWrapperProps } from '../../ViewWrapper';
import FileList from '../FileList';
import TagList from '../TagList';
import FileView from './FileView';
import TagView from './TagView';
import TodayView from './TodayView';

type AvailableViews = Record<Views, ComponentChild>;

const AllViews: AvailableViews = {
	TODAY: <TodayView />,
	FILE: <FileView />,
	TAG: <TagView />,
};

type TagListWrapperProps = {
	selectedTag: string | null;
	onSelectTag: (tag: string) => void;
};

const TagListWrapper: FunctionalComponent<TagListWrapperProps> = ({ selectedTag, onSelectTag }) => {
	const allTags = useAtomValue(allTagsAtom);
	return <TagList tags={allTags} selectedTag={selectedTag} onSelectTag={onSelectTag} />;
};

export const MainView: FunctionalComponent<ViewWrapperProps> = ({
	obsidian,
}) => {
	const data = useAtomValue(loadableAllDataAtom);
	const [view, setView] = useAtom(viewAtom);
	const [file, setFile] = useAtom(activeFileAtom);
	const [tag, setTag] = useAtom(activeTagAtom);

	console.log(data);

	const selectFile = (file: FileType) => {
		setView(Views.FILE);
		setFile(file);
		setTag(null);
	};

	const selectTag = (selectedTag: string) => {
		setView(Views.TAG);
		setTag(selectedTag);
		setFile(null);
	};

	const selectView = (view: Views) => {
		setView(view);
		setFile(null);
		setTag(null);
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
				className="flex-shrink-0 w-1/3 px-4 pt-4 overflow-auto"
				style={{ backgroundColor: '#201B27' }}
			>
				{/* <ViewSelector view={view} onSelectView={selectView} /> */}

				{data.state === 'hasData' && (
					<>
						<div className="mb-6">
							<h2 className="text-sm font-semibold mb-2 opacity-60">TAGS</h2>
							<TagListWrapper
								selectedTag={tag}
								onSelectTag={selectTag}
							/>
						</div>
						<div className="mb-6">
							<h2 className="text-sm font-semibold mb-2 opacity-60">FILES</h2>
							<FileList
								files={data.data.files}
								selectedFile={file}
								onSelectFile={selectFile}
							/>
						</div>
					</>
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
