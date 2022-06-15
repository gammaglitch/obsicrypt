import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

import { FileType } from '../types/File';

type FileListProps = {
	files: FileType[];
	selectFile: (file: FileType) => void;
};

const FileList: FunctionalComponent<FileListProps> = ({
	files,
	selectFile,
}) => {
	const [activeFile, setActiveFile] = useState(null);

	const onSelectFile = (file: FileType) => {
		setActiveFile(file);
		selectFile(file);
	};

	return (
		<div>
			{files.map((file) => (
				<div key={file.name} onClick={() => onSelectFile(file)}>
					{file.name}
				</div>
			))}
		</div>
	);
};

export default FileList;
