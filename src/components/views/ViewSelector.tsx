import { FunctionalComponent } from 'preact';
import useStore from '../../store/store';
import { FileType } from '../../types/File';
import FileList from '../FileList';

type ViewSelectorProps = {};

const ViewSelector: FunctionalComponent<ViewSelectorProps> = () => {
	return (
		<div
			className="w-full h-full px-2 py-1 border border-gray-800 shadow-sm"
			style={{ backgroundColor: '#1F1C1B' }}
		>
			<div className="mb-8">
				<h1>Views</h1>
				<div className="pl-2">
					<div>Inbox</div>
					<div>Today</div>
					<div>Anytime</div>
					<div>Someday</div>
				</div>
			</div>

			<div>
				<h1>Files</h1>
				<div className="pl-2">
					<FileList />
				</div>
			</div>
		</div>
	);
};

export default ViewSelector;
