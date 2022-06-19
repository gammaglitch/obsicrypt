import { Plugin } from 'obsidian';
import { useEffect, useState } from 'preact/hooks';

import useStore from './store/store';
import {
	parseAllFilesInVault,
	replaceLineInFile,
	searchAndReplaceLineInFile,
} from './helpers/files';

import { FileType } from './types/File';
import { TaskType } from './types/Task';

export function useFileManager(obsidian: Plugin) {
	const { files, setFiles, setTasks } = useStore();

	const loadTasksFromVault = async () => {
		const { files, tasks } = await parseAllFilesInVault(obsidian);

		setFiles(files);
		setTasks(tasks);
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

	const updateTask = async (task: TaskType, text: string) => {
		await searchAndReplaceLineInFile(
			obsidian,
			task.filePath,
			task.line.start,
			task.text,
			text
		);
		loadTasksFromVault();
	};

	useEffect(() => {
		loadTasksFromVault();
		console.log('onMount:FileManager');
	}, []);

	return { files, toggleTaskStatus, loadTasksFromVault, updateTask };
}
