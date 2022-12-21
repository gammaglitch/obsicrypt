import { FunctionalComponent } from 'preact';

import { FileType } from '../types/File';
import ViewRow from './views/ViewRow';

type FileListProps = {
	files: FileType[];
	selectedFile: FileType | null;
	onSelectFile: (file: FileType) => void;
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
					label={file.name.replace('.md', '')}
					onClick={() => onSelectFile(file)}
					active={selectedFile?.path === file.path}
				/>
			))}
		</div>
	);
};

export default FileList;
