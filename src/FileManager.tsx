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
		.map((item) => {
			const textLine = fileLines[item.position.start.line];
			const textOnly = textLine.substring(textLine.indexOf(']') + 2);

			return {
				status: textLine.includes('[x]'),
				text: textLine,
				start: item.position.start.line,
			};
		});
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

	const toggleTaskStatus = async (file: FileType, task: TaskType) => {
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			file.path
		) as TFile;
		const fileCache = obsidian.app.metadataCache.getFileCache(fileRef);
		const listItemsCache = fileCache.listItems;
		const fileContent = await obsidian.app.vault.read(fileRef);
		const fileLines = fileContent.split('\n');

		console.log('status', task.status);
		console.log('is', task.text);

		let newTask;

		if (task.status) {
			newTask = task.text.replace('[x]', '[ ]');
		} else {
			newTask = task.text.replace('[ ]', '[x]');
		}

		console.log('should', newTask);

		await obsidian.app.vault.modify(
			fileRef,
			fileContent.replace(task.text, newTask)
		);

		loadTasksFromVault();
	};

	useEffect(() => {
		loadTasksFromVault();
		console.log('onMount:FileManager');
	}, []);

	return { files, toggleTaskStatus, loadTasksFromVault };
}
