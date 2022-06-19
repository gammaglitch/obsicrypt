import { Plugin, TFile } from 'obsidian';

import { extractTaskFromListItem } from './tasks';
import { FileType } from '../types/File';
import { TaskType } from '../types/Task';

function getTaskListItems(obsidian: Plugin, file: TFile) {
	const fileCache = obsidian.app.metadataCache.getFileCache(file);
	const allListItems = fileCache.listItems;
	const taskListItems = allListItems.filter((item) =>
		item.hasOwnProperty('task')
	);

	return taskListItems;
}

export async function parseAllFilesInVault(
	obsidian: Plugin
): Promise<{ files: FileType[]; tasks: TaskType[] }> {
	const allFiles = await Promise.all(obsidian.app.vault.getMarkdownFiles());
	const files: FileType[] = [];
	const tasks: TaskType[] = [];

	for (const file of allFiles) {
		const taskListItems = getTaskListItems(obsidian, file);

		const fileContent = await obsidian.app.vault.cachedRead(file);
		const fileLines = fileContent.split('\n');

		const fileTasks: TaskType[] = taskListItems.map((item) => ({
			...extractTaskFromListItem(item, fileLines),
			filePath: file.path,
		}));

		const loadedFile = { name: file.name, path: file.path };
		files.push(loadedFile);
		tasks.push(...fileTasks);
	}

	return { files, tasks };
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
