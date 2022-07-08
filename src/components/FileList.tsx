import { FunctionalComponent } from 'preact';

import useStore from '../store/store';
import { FileType } from '../types/File';
import { Views } from '../types/Views';
import ViewRow from './views/ViewRow';

type FileListProps = {};

const FileList: FunctionalComponent<FileListProps> = () => {
	const { selectFile, selectedFile, files, selectView } = useStore();

	const onSelectFile = (file: FileType) => {
		selectFile(file);
		selectView(Views.FILE);
	};

	return (
		<div>
			{files.map((file) => (
				<ViewRow
					onClick={() => onSelectFile(file)}
					active={selectedFile?.path === file.path}
					label={file.name.replace('.md', '')}
				/>
			))}
		</div>
	);
};

export default FileList;
