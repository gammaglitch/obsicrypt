import { useAtom, useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { FunctionalComponent } from 'preact';
import { activeFileAtom, filesAtom, loadableFiles } from '../store/atoms/files';

import useStore from '../store/store';
import { FileType } from '../types/File';
import { Views } from '../types/Views';
import ViewRow from './views/ViewRow';

type FileListProps = {};

const FileList: FunctionalComponent<FileListProps> = () => {
	const { selectFile, selectedFile, selectView } = useStore();
	const files = useAtomValue(loadableFiles);
	const setActiveFile = useUpdateAtom(activeFileAtom);

	const onSelectFile = (file: FileType) => {
		selectFile(file);
		setActiveFile(file);
		selectView(Views.FILE);
	};

	if (files.state === 'loading') {
		return <div>...</div>;
	}

	if (files.state === 'hasError') {
		return <h1>error loading files</h1>;
	}

	return (
		<div>
			{files.data.map((file) => (
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
