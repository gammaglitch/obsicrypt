import { Metadata } from '../../types/Task';

type SerializableTask = Metadata & {
	text: string;
	isComplete: boolean;
	originalText?: string;
};

function getListMarker(originalText?: string): string {
	return originalText?.match(/^\s*[-*]/)?.[0] || '-';
}

export function serializeTaskLine(task: SerializableTask): string {
	const marker = task.isComplete ? '[x]' : '[ ]';
	const listMarker = getListMarker(task.originalText);
	const metadataParts: string[] = [];

	if (task.due) metadataParts.push(`{due:${task.due}}`);
	if (task.start) metadataParts.push(`{start:${task.start}}`);
	if (task.completedOn) metadataParts.push(`{completedOn:${task.completedOn}}`);

	Object.entries(task.custom).forEach(([key, values]) => {
		values.forEach((value) => metadataParts.push(`{${key}:${value}}`));
	});

	task.tags.forEach((tag) => metadataParts.push(`#${tag}`));
	task.contexts.forEach((context) => metadataParts.push(`@${context}`));

	const metadata =
		metadataParts.length > 0 ? ` ${metadataParts.join(' ')}` : '';

	return `${listMarker} ${marker} ${task.text.trim()}${metadata}`;
}
