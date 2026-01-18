import { today } from '../dates';
import { serializeTaskLine } from './serialize';
import { clearTaskLineMetadata, parseTaskLine } from './util';

export function toggleTaskLine(originalText: string, isDone: boolean): string {
	const task = parseTaskLine(originalText);

	if (!isDone) {
		return serializeTaskLine({
			...task,
			isComplete: true,
			completedOn: today(),
		});
	}

	return clearTaskLineMetadata(
		serializeTaskLine({
			...task,
			isComplete: false,
		}),
		'completedOn'
	);
}

export function replaceTaskLine(
	content: string,
	lineNumber: number,
	newText: string
): string {
	const lines = content.split('\n');
	lines[lineNumber] = newText;
	return lines.join('\n');
}

type TaskPosition = { position: { end: { line: number } } };

export function insertTaskIntoLines(
	content: string,
	taskItems: TaskPosition[],
	text: string
): string {
	const lines = content.split('\n');
	const newLine = serializeTaskLine({
		text,
		isComplete: false,
		due: null,
		start: null,
		completedOn: null,
		tags: [],
		contexts: [],
		custom: {},
	});

	if (taskItems.length > 0) {
		const lastTask = taskItems[taskItems.length - 1];
		lines.splice(lastTask.position.end.line + 1, 0, newLine);
	} else {
		lines.push(newLine);
	}

	return lines.join('\n');
}

export function replaceLineContent(
	content: string,
	line: number,
	search: string,
	replace: string
): string {
	const lines = content.split('\n');
	lines[line] = lines[line].replace(search, replace);
	return lines.join('\n');
}
