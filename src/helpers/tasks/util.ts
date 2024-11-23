import { ListItemCache, TFile } from 'obsidian';

import { Metadata, TaskType } from '../../types/Task';
import { getListItems } from '../files/util';
import { Taskey } from './types';

type MetadataExtractionState = {
	text: string;
	metadata: Metadata;
};

type MetadataExtractor = (
	state: MetadataExtractionState
) => MetadataExtractionState;

function getTaskStatus(text: string): boolean {
	return text.includes('[x]');
}

export function stripTaskCheckbox(text: string): string {
	return text.replace(/^\s*[-*]\s+\[[xX ]\]\s*/, '').trimStart();
}

function createEmptyMetadata(): Metadata {
	return {
		due: null,
		start: null,
		completedOn: null,
		tags: [],
		contexts: [],
		custom: {},
	};
}

const normalizeKeyValue = {
	due: (value: string) => value.trim(),
	start: (value: string) => value.trim(),
	completedon: (value: string) => value.trim(),
} as const;

type NormalizedKey = keyof typeof normalizeKeyValue;

const keyToMetadataField: Record<NormalizedKey, keyof Metadata> = {
	due: 'due',
	start: 'start',
	completedon: 'completedOn',
};

const BRACED_METADATA_PATTERN = /\{(?<key>[a-zA-Z0-9_-]+):(?<value>[^}]+)\}/g;

function extractKeyValueMetadata(
	state: MetadataExtractionState
): MetadataExtractionState {
	for (const match of state.text.matchAll(BRACED_METADATA_PATTERN)) {
		const key = match.groups?.key?.toLowerCase();
		const value = match.groups?.value?.trim();

		if (!key || !value) {
			continue;
		}

		if (key in normalizeKeyValue) {
			const typedKey = key as NormalizedKey;
			const metadataField = keyToMetadataField[typedKey];
			state.metadata[metadataField] = normalizeKeyValue[typedKey](value) as any;
			continue;
		}

		if (!state.metadata.custom[key]) {
			state.metadata.custom[key] = [];
		}

		if (!state.metadata.custom[key].includes(value)) {
			state.metadata.custom[key].push(value);
		}
	}

	const text = state.text.replace(BRACED_METADATA_PATTERN, ' ');

	return {
		text,
		metadata: state.metadata,
	};
}

const TAG_PATTERN = /(^|\s)#([^\s#@{}]+)/g;

function extractTags(state: MetadataExtractionState): MetadataExtractionState {
	const text = state.text.replace(
		TAG_PATTERN,
		(match, prefix: string, tag: string) => {
			const normalized = tag.trim();

			if (normalized && !state.metadata.tags.includes(normalized)) {
				state.metadata.tags.push(normalized);
			}

			return prefix ?? '';
		}
	);

	return {
		text,
		metadata: state.metadata,
	};
}

const CONTEXT_PATTERN = /(^|\s)@([^\s#@{}]+)/g;

function extractContexts(
	state: MetadataExtractionState
): MetadataExtractionState {
	const text = state.text.replace(
		CONTEXT_PATTERN,
		(match, prefix: string, context: string) => {
			const normalized = context.trim();

			if (normalized) {
				const alreadyPresent = state.metadata.contexts.some(
					(existing) => existing.toLowerCase() === normalized.toLowerCase()
				);

				if (!alreadyPresent) {
					state.metadata.contexts.push(normalized);
				}
			}

			return prefix ?? '';
		}
	);

	return {
		text,
		metadata: state.metadata,
	};
}

const metadataExtractors: MetadataExtractor[] = [
	extractKeyValueMetadata,
	extractTags,
	extractContexts,
];

function normalizeDisplayText(text: string): string {
	return text.replace(/\s{2,}/g, ' ').trim();
}

export function parseTaskContent(text: string) {
	const stripped = stripTaskCheckbox(text);
	const initial: MetadataExtractionState = {
		text: stripped,
		metadata: createEmptyMetadata(),
	};

	const { text: metadataFreeText, metadata } = metadataExtractors.reduce(
		(state, extractor) => extractor(state),
		initial
	);

	return {
		text: metadataFreeText,
		displayText: normalizeDisplayText(metadataFreeText),
		metadata,
	};
}

export function getTask(
	listItem: ListItemCache,
	fileLines: string[]
): TaskType {
	const textLine = fileLines[listItem.position.start.line];
	const { text, displayText, metadata } = parseTaskContent(textLine);

	return {
		filePath: '',
		isComplete: getTaskStatus(textLine),
		text,
		displayText,
		originalText: textLine,
		line: {
			start: listItem.position.start.line,
			end: listItem.position.end.line,
		},
		...metadata,
	};
}

export function updateMetadata(text: string, key: string, value: string) {
	const normalizedKey = key.toLowerCase();
	const pattern = new RegExp(BRACED_METADATA_PATTERN.source, 'g');
	let result = text;
	let replaced = false;

	for (const match of text.matchAll(pattern)) {
		const matchKey = match.groups?.key;

		if (matchKey && matchKey.toLowerCase() === normalizedKey) {
			const replacement = `{${matchKey}:${value}}`;
			const start = match.index ?? 0;
			const end = start + match[0].length;

			result = `${result.slice(0, start)}${replacement}${result.slice(end)}`;
			replaced = true;
			break;
		}
	}

	if (replaced) {
		return result;
	}

	const needsSpace = result.length > 0 && !/\s$/.test(result);
	const spacer = needsSpace ? ' ' : '';

	return `${result}${spacer}{${key}:${value}}`;
}

function isTask(item: ListItemCache): boolean {
	return Object.hasOwn(item, 'task');
}

function mapTask(item: ListItemCache, lines: string[]) {
	const text = lines[item.position.start.line];
	const { text: bodyText, displayText, metadata } = parseTaskContent(text);

	return {
		text: bodyText,
		displayText,
		originalText: text,
		done: getTaskStatus(text),
		...metadata,
	};
}

export function makeTasks(
	cachedItems: ListItemCache[],
	file: TFile,
	fileContent: string
): Taskey[] {
	const lines = fileContent.split('\n');
	const tasks = cachedItems.filter(isTask).map((i) => ({
		...mapTask(i, lines),
		filePath: file.path,
		data: { line: i.position.start.line },
	}));

	return tasks;
}
