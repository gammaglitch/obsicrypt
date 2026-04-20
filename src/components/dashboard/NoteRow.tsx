import { FunctionalComponent } from 'preact';

export type NoteRowProps = {
	path: string;
	count: number;
	active: boolean;
	onSelect: (path: string) => void;
};

function basename(path: string): string {
	const slash = path.lastIndexOf('/');
	const name = slash >= 0 ? path.slice(slash + 1) : path;
	return name.endsWith('.md') ? name.slice(0, -3) : name;
}

export const NoteRow: FunctionalComponent<NoteRowProps> = ({
	path,
	count,
	active,
	onSelect,
}) => (
	<div
		className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded text-sm ${
			active
				? 'bg-obsidian-bg-active text-obsidian-text'
				: 'text-obsidian-text-muted hover:bg-obsidian-bg-hover'
		}`}
		onClick={() => onSelect(path)}
		title={path}
	>
		<span className="truncate flex-1">{basename(path)}</span>
		<span className="flex-shrink-0 text-xs text-obsidian-text-faint">
			{count}
		</span>
	</div>
);
