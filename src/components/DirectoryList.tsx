import { FunctionalComponent } from 'preact';

import ViewRow from './views/ViewRow';

type DirectoryListProps = {
	directories: string[];
	selectedDirectory: string | null;
	onSelectDirectory: (dir: string) => void;
};

const DirectoryList: FunctionalComponent<DirectoryListProps> = ({
	directories,
	selectedDirectory,
	onSelectDirectory,
}) => {
	return (
		<div className="h-full overflow-scroll">
			{directories.map((dir) => (
				<ViewRow
					key={dir}
					label={dir}
					onClick={() => onSelectDirectory(dir)}
					active={selectedDirectory === dir}
				/>
			))}
		</div>
	);
};

export default DirectoryList;
