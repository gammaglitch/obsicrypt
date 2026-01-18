import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai';
import { ComponentChild, FunctionalComponent } from 'preact';

import { Filey } from '../../helpers/files/types';
import {
	activeDirectoryAtom,
	activeFileAtom,
	activeTagAtom,
	allDirectoriesAtom,
	allTagsAtom,
	loadableAllDataAtom,
} from '../../store/atoms/files';
import { viewAtom } from '../../store/atoms/view';
import { Views } from '../../types/Views';
import { ViewWrapperProps } from '../../ViewWrapper';
import { config, SidebarSection as SidebarSectionId } from '../../config';
import DirectoryList from '../DirectoryList';
import FileList from '../FileList';
import SidebarSection from '../SidebarSection';
import TagList from '../TagList';
import ViewRow from './ViewRow';
import DirectoryView from './DirectoryView';
import FileView from './FileView';
import InboxView from './InboxView';
import TagView from './TagView';
import TodayView from './TodayView';

type AvailableViews = Record<Views, ComponentChild>;

const AllViews: AvailableViews = {
	TODAY: <TodayView />,
	FILE: <FileView />,
	TAG: <TagView />,
	DIR: <DirectoryView />,
	INBOX: <InboxView />,
};

type TagListWrapperProps = {
	selectedTag: string | null;
	onSelectTag: (tag: string) => void;
};

const TagListWrapper: FunctionalComponent<TagListWrapperProps> = ({
	selectedTag,
	onSelectTag,
}) => {
	const allTags = useAtomValue(allTagsAtom);
	return (
		<TagList
			tags={allTags}
			selectedTag={selectedTag}
			onSelectTag={onSelectTag}
		/>
	);
};

type DirectoryListWrapperProps = {
	selectedDirectory: string | null;
	onSelectDirectory: (dir: string) => void;
};

const DirectoryListWrapper: FunctionalComponent<DirectoryListWrapperProps> = ({
	selectedDirectory,
	onSelectDirectory,
}) => {
	const allDirectories = useAtomValue(allDirectoriesAtom);
	return (
		<DirectoryList
			directories={allDirectories}
			selectedDirectory={selectedDirectory}
			onSelectDirectory={onSelectDirectory}
		/>
	);
};

export const MainView: FunctionalComponent<ViewWrapperProps> = ({
	obsidian,
}) => {
	void obsidian;
	const data = useAtomValue(loadableAllDataAtom);
	const [view, setView] = useAtom(viewAtom);
	const [file, setFile] = useAtom(activeFileAtom);
	const [tag, setTag] = useAtom(activeTagAtom);
	const [directory, setDirectory] = useAtom(activeDirectoryAtom);

	const selectFile = (file: Filey) => {
		setView(Views.FILE);
		setFile(file);
		setTag(null);
		setDirectory(null);
	};

	const selectTag = (selectedTag: string) => {
		setView(Views.TAG);
		setTag(selectedTag);
		setFile(null);
		setDirectory(null);
	};

	const selectDirectory = (dir: string) => {
		setView(Views.DIR);
		setDirectory(dir);
		setFile(null);
		setTag(null);
	};

	const selectView = (view: Views) => {
		setView(view);
		setFile(null);
		setTag(null);
		setDirectory(null);
	};

	const sidebarSections: Record<SidebarSectionId, ComponentChild> = {
		custom: (
			<SidebarSection key="custom" title="CUSTOM">
				<ViewRow
					label="Inbox"
					active={view === Views.INBOX}
					onClick={() => selectView(Views.INBOX)}
				/>
				<ViewRow
					label="Today"
					active={view === Views.TODAY}
					onClick={() => selectView(Views.TODAY)}
				/>
			</SidebarSection>
		),
		tags:
			data.state === 'hasData' ? (
				<SidebarSection key="tags" title="TAGS">
					<TagListWrapper selectedTag={tag} onSelectTag={selectTag} />
				</SidebarSection>
			) : null,
		directories:
			data.state === 'hasData' ? (
				<SidebarSection key="directories" title="DIRECTORIES">
					<DirectoryListWrapper
						selectedDirectory={directory}
						onSelectDirectory={selectDirectory}
					/>
				</SidebarSection>
			) : null,
		files:
			data.state === 'hasData' ? (
				<SidebarSection key="files" title="FILES">
					<FileList
						files={data.data.files}
						selectedFile={file}
						onSelectFile={selectFile}
					/>
				</SidebarSection>
			) : null,
	};

	const getView = () => {
		if (view) {
			return AllViews[view];
		}
		return <div>no active view</div>;
	};

	return (
		<div className="flex w-full h-full">
			<div className="flex-shrink-0 w-1/3 px-4 pt-4 overflow-auto bg-obsidian-bg-secondary">
				{config.sidebar.sections.map((id) => sidebarSections[id])}
			</div>

			<div className="flex-1 w-2/3 px-4 pt-8 bg-obsidian-bg">{getView()}</div>
		</div>
	);
};
