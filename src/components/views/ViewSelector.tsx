import { FunctionalComponent } from 'preact';
import { Views } from '../../types/Views';
import ViewRow from './ViewRow';

type ViewSelectorProps = {
	view: Views | null;
	onSelectView: (view: Views) => void;
};

const ViewSelector: FunctionalComponent<ViewSelectorProps> = ({
	view,
	onSelectView,
}) => {
	return (
		<div className="w-full">
			<div className="mb-8">
				<h1>Views</h1>
				<div className="pl-2">
					<ViewRow
						label="Today"
						active={view === Views.TODAY}
						onClick={() => onSelectView(Views.TODAY)}
					/>
				</div>
			</div>
		</div>
	);
};

export default ViewSelector;
