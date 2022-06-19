import { ListItemCache } from 'obsidian';

import { Metadata, TaskType } from '../types/Task';

function getTaskStatus(text: string): boolean {
	const isComplete = text.includes('[x]');

	return isComplete;
}

export function extractTaskFromListItem(
	listItem: ListItemCache,
	fileLines: string[]
): TaskType {
	const textLine = fileLines[listItem.position.start.line];
	const metadata = extractMetadata(textLine);
	const clearedText = removeMetadata(textLine);

	return {
		filePath: '',
		isComplete: getTaskStatus(textLine),
		text: clearedText,
		originalText: textLine,
		line: {
			start: listItem.position.start.line,
			end: listItem.position.end.line,
		},
		...metadata,
	};
}

const keys = ['due'];

function extractMetadata(text: string): Metadata {
	const metadata: Metadata = {
		due: null,
	};

	for (const key of keys) {
		const patternData = new RegExp(`(?<=${key}\:).*?(?=\})`);
		const match = text.match(patternData);

		if (match && match.length === 1) {
			metadata[key as keyof Metadata] = match[0];
		}
	}

	return metadata;
}

function removeMetadata(text: string): string {
	return text.replaceAll(/(\{).*?(\})/g, '').replaceAll(/- \[.\] /g, '');
}
