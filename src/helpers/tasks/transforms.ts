import { today } from '../dates';
import { updateMetadata } from './util';

export function toggleTaskLine(originalText: string, isDone: boolean): string {
	const currentMarker = isDone ? '[x]' : '[ ]';
	const nextMarker = isDone ? '[ ]' : '[x]';
	let newText = originalText.replace(currentMarker, nextMarker);

	if (!isDone) {
		newText = updateMetadata(newText, 'completedOn', today());
	} else {
		newText = newText.replace(/\s*\{completedOn:[^}]+\}/gi, '');
	}

	return newText;
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
	const newLine = `- [ ] ${text}`;

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
