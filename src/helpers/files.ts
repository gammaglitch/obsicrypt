import { ListItemCache, Plugin, TFile } from 'obsidian';

import { FileType } from '../types/File';
import { TaskType } from '../types/Task';
import { getTask } from './tasks';

function getTasks(file: FileType) {
	const { path, listItems, fileLines } = file;
	const taskItems = listItems.filter((item) =>
		Object.hasOwnProperty.call(item, 'task')
	);

	const fileTasks: TaskType[] = taskItems.map((item) => ({
		...getTask(item, fileLines),
		filePath: path,
	}));

	return fileTasks;
}

export function getTasksFromFiles(files: FileType[]): Map<string, TaskType[]> {
	const tasks: Map<string, TaskType[]> = new Map();

	for (const file of files) {
		const fileTasks = getTasks(file);

		tasks.set(file.path, fileTasks);
	}

	return tasks;
}

export async function searchAndReplaceInFile(
	obsidian: Plugin,
	filePath: string,
	search: string,
	replace: string
) {
	const fileRef = obsidian.app.vault.getAbstractFileByPath(filePath) as TFile;
	const fileContent = await obsidian.app.vault.read(fileRef);

	return obsidian.app.vault.modify(
		fileRef,
		fileContent.replace(search, replace)
	);
}

export async function searchAndReplaceLineInFile(
	obsidian: Plugin,
	filePath: string,
	line: number,
	search: string,
	replace: string
) {
	const fileRef = obsidian.app.vault.getAbstractFileByPath(filePath) as TFile;
	const fileContent = await obsidian.app.vault.read(fileRef);
	const fileLines = fileContent.split('\n');

	fileLines[line] = fileLines[line].replace(search, replace);

	return obsidian.app.vault.modify(fileRef, fileLines.join('\n'));
}

export async function replaceLineInFile(
	obsidian: Plugin,
	filePath: string,
	line: number,
	replace: string
) {
	const fileRef = obsidian.app.vault.getAbstractFileByPath(filePath) as TFile;
	const fileContent = await obsidian.app.vault.read(fileRef);
	const fileLines = fileContent.split('\n');

	fileLines[line] = replace;

	return obsidian.app.vault.modify(fileRef, fileLines.join('\n'));
}

function getListItems(obsidian: Plugin, file: TFile): ListItemCache[] {
	const cache = obsidian.app.metadataCache.getFileCache(file);

	if (cache) {
		return cache.listItems ?? [];
	}
	return [];
}

function getTasksFromListItems(listItems: ListItemCache[]): ListItemCache[] {
	return listItems.filter((item) => Object.hasOwn(item, 'task'));
}

async function buildFileType(obsidian: Plugin, file: TFile) {
	const fileContent = await obsidian.app.vault.cachedRead(file);
	const listItems = getListItems(obsidian, file);

	return {
		name: file.name,
		path: file.path,
		fileContent,
		fileLines: fileContent.split('\n'),
		listItems,
	};
}

export async function getFileByPath(
	obsidian: Plugin,
	path: string
): Promise<FileType> {
	const fileRef = obsidian.app.vault.getAbstractFileByPath(path);

	return buildFileType(obsidian, fileRef as TFile);
}

function buildTasks(fileContent: string, listItems: ListItemCache[]) {
	const fileLines = fileContent.split('\n');
	const tasks = [];

	for (const item of listItems) {
		const textLine = fileLines[item.position.start.line];
		tasks.push({ text: textLine });
	}

	return tasks;
}

async function loadFile(obsidian: Plugin, file: TFile) {
	const fileContent = await obsidian.app.vault.cachedRead(file);
	const listItems = getListItems(obsidian, file);
	const filteredListItems = getTasksFromListItems(listItems);

	if (filteredListItems.length > 0) {
		console.log(buildTasks(fileContent, filteredListItems));
	}

	return {
		name: file.name,
		path: file.path,
		fileContent,
		fileLines: fileContent.split('\n'),
		listItems,
	};
}

type Taskey = {
	text: string;
};

type Filey = {
	name: string;
	path: string;
	// tasks: { text: string }[];
	// data: {
	// 	content: string;
	// 	items: ListItemCache[];
	// };
};

function isTask(item: ListItemCache): boolean {
	return Object.hasOwn(item, 'task');
}

function mapTask(item: ListItemCache, lines: string[]) {
	return { text: lines[item.position.start.line] };
}

async function makeTasks(obsidian: Plugin, file: TFile) {
	const content = await obsidian.app.vault.cachedRead(file);
	const cachedItems = getListItems(obsidian, file);
	const lines = content.split('\n');
	const tasks = cachedItems.filter(isTask).map((i) => mapTask(i, lines));

	return tasks;
}

function makeFile(obsidian: Plugin, file: TFile) {
	// const content = await obsidian.app.vault.cachedRead(file);
	// const cachedItems = getListItems(obsidian, file);
	// const lines = content.split('\n');
	// const tasks = cachedItems.filter(isTask).map((i) => mapTask(i, lines));

	return { name: file.name, path: file.path };

	// return {
	// 	name: file.name,
	// 	path: file.path,
	// 	tasks,
	// 	data: {
	// 		content,
	// 		items: cachedItems,
	// 	},
	// };
}

async function parseFiles(
	obsidian: Plugin,
	files: TFile[]
): Promise<{ files: Filey[]; tasks: Taskey[] }> {
	const parsedFiles: Filey[] = [];
	const tasks = [];

	for (const file of files) {
		parsedFiles.push(makeFile(obsidian, file));
		tasks.push(makeTasks(obsidian, file));
	}

	const parsedTasks = await Promise.all(tasks);

	return { files: parsedFiles, tasks: parsedTasks.flat() };
}

export async function getFiles(obsidian: Plugin): Promise<Map<string, Filey>> {
	const { files, tasks } = await parseFiles(
		obsidian,
		obsidian.app.vault.getMarkdownFiles()
	);
	console.log('getFiles:', files, tasks);

	return files.reduce((prev, curr) => {
		prev.set(curr.path, curr);
		return prev;
	}, new Map());
}
