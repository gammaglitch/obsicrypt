import { Plugin } from 'obsidian';
import { useEffect, useState } from 'preact/hooks';

import useStore from './store/store';
import { parseAllFilesInVault, replaceLineInFile } from './helpers/files';

import { FileType } from './types/File';
import { TaskType } from './types/Task';

export function useFileManager(obsidian: Plugin) {
	const { files, setFiles } = useStore();

	const loadTasksFromVault = async () => {
		const files = await parseAllFilesInVault(obsidian);

		setFiles(files);
	};

	const toggleTaskStatus = async (file: FileType, task: TaskType) => {
		let newTask;

		if (task.isComplete) {
			newTask = task.text.replace('[x]', '[ ]');
		} else {
			newTask = task.text.replace('[ ]', '[x]');
		}

		await replaceLineInFile(obsidian, file.path, task.line.start, newTask);

		loadTasksFromVault();
	};

	useEffect(() => {
		loadTasksFromVault();
		console.log('onMount:FileManager');
	}, []);

	return { files, toggleTaskStatus, loadTasksFromVault };
}
