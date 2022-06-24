import { Plugin, TAbstractFile, TFile } from 'obsidian';
import { useEffect } from 'preact/hooks';

import useStore from './store/store';
import {
	getFileByPath,
	getFiles,
	getTasksFromFiles,
	replaceLineInFile,
	searchAndReplaceLineInFile,
} from './helpers/files';

import { FileType } from './types/File';
import { TaskType } from './types/Task';

export function useFileManager(obsidian: Plugin) {
	const { files, setFiles, setTasks, replaceFile, addFile, removeFile } =
		useStore();

	const toggleTaskStatus = async (file: FileType, task: TaskType) => {
		let newTask;

		if (task.isComplete) {
			newTask = task.text.replace('[x]', '[ ]');
		} else {
			newTask = task.text.replace('[ ]', '[x]');
		}

		await replaceLineInFile(obsidian, file.path, task.line.start, newTask);
	};

	const updateTask = async (task: TaskType, text: string) => {
		await searchAndReplaceLineInFile(
			obsidian,
			task.filePath,
			task.line.start,
			task.text,
			text
		);
	};

	const loadTasksIntoStore = async () => {
		const files = await getFiles(obsidian);
		setFiles(files);
	};

	const reloadTasksHandler = async () => {
		const currTasks: TaskType[] = await getTasksFromFiles(files);
		setTasks(currTasks);
	};

	const replaceFileHandler = async (oldPath: string, newPath: string) => {
		const file = await getFileByPath(obsidian, newPath);
		replaceFile(oldPath, file);
	};

	const updateFileHandler = async (path: string) => {
		const file = await getFileByPath(obsidian, path);
		replaceFile(path, file);
	};

	const addFileToStore = async (path: string) => {
		const file = await getFileByPath(obsidian, path);
		addFile(file);
	};

	const deleteFileHandler = (path: string) => {
		removeFile(path);
	};

	useEffect(() => {
		reloadTasksHandler();
	}, [files]);

	useEffect(() => {
		loadTasksIntoStore();

		obsidian.app.metadataCache.on('changed', (file: TFile) => {
			if (file instanceof TFile) {
				updateFileHandler(file.path);
			}
		});

		obsidian.app.vault.on('create', (file: TAbstractFile) => {
			if (file instanceof TFile) {
				addFileToStore(file.path);
			}
		});

		obsidian.app.vault.on('delete', (file: TAbstractFile) => {
			if (file instanceof TFile) {
				deleteFileHandler(file.path);
			}
		});

		obsidian.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => {
			if (file instanceof TFile) {
				replaceFileHandler(oldPath, file.path);
			}
		});
	}, []);

	return { files, toggleTaskStatus, updateTask };
}
