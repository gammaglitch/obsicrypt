import { ListItemCache, Plugin, TFile } from 'obsidian';

import { FileType } from '../types/File';
import { TaskType } from '../types/Task';
import { extractTaskFromListItem } from './tasks';

export function getTasksFromFiles(files: FileType[]) {
	const tasks: TaskType[] = [];

	for (const file of files) {
		const taskListItems = file.listItems.filter((item) =>
			item.hasOwnProperty('task')
		);

		const fileTasks: TaskType[] = taskListItems.map((item) => ({
			...extractTaskFromListItem(item, file.fileLines),
			filePath: file.path,
		}));

		tasks.push(...fileTasks);
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

export async function getFiles(obsidian: Plugin): Promise<FileType[]> {
	const allFiles = obsidian.app.vault.getMarkdownFiles();

	const files: FileType[] = [];

	for (const file of allFiles) {
		const fileContent = await obsidian.app.vault.cachedRead(file);
		const listItems = getListItems(obsidian, file);

		files.push({
			name: file.name,
			path: file.path,
			fileContent,
			fileLines: fileContent.split('\n'),
			listItems,
		});
	}

	return files;
}
