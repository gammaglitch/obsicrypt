import { FunctionalComponent } from 'preact';

import { StoredFile } from '../helpers/files/types';
import ViewRow from './views/ViewRow';

type FileListProps = {
	files: StoredFile[];
	selectedFile: StoredFile | null;
	onSelectFile: (file: StoredFile) => void;
};

const FileList: FunctionalComponent<FileListProps> = ({
	files,
	selectedFile,
	onSelectFile,
}) => {
	return (
		<div className="h-full overflow-scroll">
			{files.map((file) => (
				<ViewRow
					key={file.path}
					label={file.name}
					onClick={() => onSelectFile(file)}
					active={selectedFile?.path === file.path}
				/>
			))}
		</div>
	);
};

export default FileList;
