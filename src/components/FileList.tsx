import { FunctionalComponent } from 'preact';

import useStore from '../store/store';
import { FileType } from '../types/File';
import ViewRow from './views/ViewRow';

type FileListProps = {
	files: FileType[];
};

const FileList: FunctionalComponent<FileListProps> = ({ files }) => {
	const { selectFile, selectedFile } = useStore();

	const onSelectFile = (file: FileType) => {
		selectFile(file);
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
