import { FunctionalComponent } from 'preact';
import useStore from '../../store/store';
import { Views } from '../../types/Views';
import ViewRow from './ViewRow';

import FileList from '../FileList';

type ViewSelectorProps = {};

const ViewSelector: FunctionalComponent<ViewSelectorProps> = () => {
	const { selectedView, selectView } = useStore();

	return (
		<div
			className="w-full h-full px-2 py-1 border border-gray-800 shadow-sm"
			style={{ backgroundColor: '#1F1C1B' }}
		>
			<div className="mb-8">
				<h1>Views</h1>
				<div className="pl-2">
					<ViewRow
						label="Today"
						active={selectedView === Views.TODAY}
						onClick={() => selectView(Views.TODAY)}
					/>
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
