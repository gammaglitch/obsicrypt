import { useAtom, useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { FunctionalComponent } from 'preact';
import { activeFileAtom, filesAtom, loadableFiles } from '../store/atoms/files';

import useStore from '../store/store';
import { FileType } from '../types/File';
import { Views } from '../types/Views';
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
		<div>
			{files.map((file) => (
				<ViewRow
					label={file.name.replace('.md', '')}
					onClick={() => onSelectFile(file)}
					active={selectedFile?.path === file.path}
				/>
			))}
		</div>
	);
};

export default FileList;
