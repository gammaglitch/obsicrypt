import { ListItemCache, Plugin, TFile } from 'obsidian';
import { useEffect, useState } from 'preact/hooks';

import { FileType } from './types/File';
import { TaskType } from './types/Task';

const buildTasks = (
	listItems: ListItemCache[],
	fileLines: string[]
): TaskType[] => {
	return listItems
		.filter((item) => item.hasOwnProperty('task'))
		.map((item) => ({
			status: item.task === 'x',
			text: fileLines[item.position.start.line],
			start: item.position.start.line,
		}));
};

export function useFileManager(obsidian: Plugin) {
	const [files, setFiles] = useState<FileType[]>([]);

	const getTasksFromFile = async (file: TFile): Promise<FileType> => {
		const fileCache = obsidian.app.metadataCache.getFileCache(file);
		const fileContent = await obsidian.app.vault.cachedRead(file);
		const fileLines = fileContent.split('\n');
		const { listItems } = fileCache;
		const tasks = buildTasks(listItems, fileLines);

		return { name: file.name, path: file.path, tasks };
	};

	const loadTasksFromVault = async () => {
		const allFiles = await Promise.all(obsidian.app.vault.getMarkdownFiles());
		const files = await Promise.all(
			allFiles.map((file) => getTasksFromFile(file))
		);

		setFiles(() => files);
	};

	const toggleTaskStatus = async (file: FileType) => {
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			file.path
		) as TFile;
		const fileCache = obsidian.app.metadataCache.getFileCache(fileRef);
		const listItemsCache = fileCache.listItems;
		const fileContent = await obsidian.app.vault.read(fileRef);
		const fileLines = fileContent.split('\n');

		await obsidian.app.vault.modify(
			fileRef,
			fileContent.replace(file.tasks[0].text, 'TOGGLED')
		);
		loadTasksFromVault();
	};

	useEffect(() => {
		loadTasksFromVault();
		console.log('onMount:FileManager');
	}, []);

	return { files, toggleTaskStatus };
}
