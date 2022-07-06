import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import useStore from '../store/store';

import { FileType } from '../types/File';

type FileListProps = {
	files: FileType[];
	selectFile: (file: FileType) => void;
};

const FileList: FunctionalComponent<FileListProps> = ({
	files,
	selectFile: asdf,
}) => {
	const { selectFile, selectedFile } = useStore();
	const [activeFile, setActiveFile] = useState(null);

	const onSelectFile = (file: FileType) => {
		selectFile(file);
	};

	return (
		<div>
			{files.map((file) => (
				<div
					key={file.name}
					onClick={() => onSelectFile(file)}
					className={`p-1 rounded ${
						selectedFile?.path === file.path ? 'bg-blue-600' : ''
					} `}
				>
					{file.name}
				</div>
			))}
		</div>
	);
};

export default FileList;
