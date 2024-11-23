import { ListItemCache, Plugin, TFile } from 'obsidian';

import { FileType } from '../../types/File';
import { TaskType } from '../../types/Task';
import { TaskeyMap } from '../tasks/types';
import { getTask, makeTasks } from '../tasks/util';
import { Filey, FileyMap } from './types';

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

function getTasksFromFiles(files: FileType[]): Map<string, TaskType[]> {
	const tasks: Map<string, TaskType[]> = new Map();

	for (const file of files) {
		const fileTasks = getTasks(file);

		tasks.set(file.path, fileTasks);
	}

	return tasks;
}

async function searchAndReplaceInFile(
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

async function replaceLineInFile(
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

export function getListItems(obsidian: Plugin, file: TFile): ListItemCache[] {
	const cache = obsidian.app.metadataCache.getFileCache(file);

	if (cache) {
		return cache.listItems ?? [];
	}
	return [];
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

export async function _getFileByPath(
	obsidian: Plugin,
	path: string
): Promise<FileType> {
	const fileRef = obsidian.app.vault.getAbstractFileByPath(path);

	return buildFileType(obsidian, fileRef as TFile);
}

export async function getFileByPath(
	obsidian: Plugin,
	path: string
): Promise<Filey> {
	const fileRef = obsidian.app.vault.getAbstractFileByPath(path) as TFile;
	const fileContent = await obsidian.app.vault.cachedRead(fileRef);

	return makeFile(fileRef, fileContent);
}

export function makeFile(file: TFile, content: string): Filey {
	return {
		name: file.name,
		path: file.path,
		data: {
			content,
		},
	};
}

async function parseFiles(
	obsidian: Plugin,
	files: TFile[]
): Promise<{ files: FileyMap; tasks: TaskeyMap }> {
	const fMap: FileyMap = new Map();
	const tMap: TaskeyMap = new Map();

	const contents = await Promise.all(
		files.map((f) => obsidian.app.vault.cachedRead(f))
	);

	for (let i = 0; i < files.length; i++) {
		fMap.set(files[i].path, makeFile(files[i], contents[i]));
		tMap.set(
			files[i].path,
			makeTasks(getListItems(obsidian, files[i]), files[i], contents[i])
		);
	}

	return { files: fMap, tasks: tMap };
}

export async function getFiles(
	obsidian: Plugin
): Promise<{ files: FileyMap; tasks: TaskeyMap }> {
	return parseFiles(obsidian, obsidian.app.vault.getMarkdownFiles());
}
