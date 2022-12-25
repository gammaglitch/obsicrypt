import { ListItemCache, Plugin, TFile } from 'obsidian';

import { Metadata, TaskType } from '../../types/Task';
import { getListItems } from '../files/util';
import { Taskey } from './types';

function getTaskStatus(text: string): boolean {
	return text.includes('[x]');
}

export function getTask(
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
		start: null,
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

export function updateMetadata(text: string, key: string, value: string) {
	const patternData = new RegExp(`(?<=${key}\:).*?(?=\})`);
	const updatedText = patternData.test(text)
		? text.replace(patternData, value)
		: `${text} {${key}:${value}}`;

	return updatedText;
}

function isTask(item: ListItemCache): boolean {
	return Object.hasOwn(item, 'task');
}

function mapTask(item: ListItemCache, lines: string[]) {
	const text = lines[item.position.start.line];
	return { text, done: getTaskStatus(text) };
}

export function makeTasks(
	obsidian: Plugin,
	file: TFile,
	fileContent: string
): Taskey[] {
	const cachedItems = getListItems(obsidian, file);
	const lines = fileContent.split('\n');
	const tasks = cachedItems.filter(isTask).map((i) => ({
		...mapTask(i, lines),
		filePath: file.path,
		data: { line: i.position.start.line },
	}));

	return tasks;
}
