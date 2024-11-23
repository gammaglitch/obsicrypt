import { FunctionalComponent } from 'preact';

import ViewRow from './views/ViewRow';

type TagListProps = {
	tags: string[];
	selectedTag: string | null;
	onSelectTag: (tag: string) => void;
};

const TagList: FunctionalComponent<TagListProps> = ({
	tags,
	selectedTag,
	onSelectTag,
}) => {
	return (
		<div className="h-full overflow-scroll">
			{tags.map((tag) => (
				<ViewRow
					key={tag}
					label={`#${tag}`}
					onClick={() => onSelectTag(tag)}
					active={selectedTag === tag}
				/>
			))}
		</div>
	);
};

export default TagList;
