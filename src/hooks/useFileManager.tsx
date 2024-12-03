import { useAtomValue } from 'jotai';
import { TFile } from 'obsidian';

import { today } from '../helpers/dates';
import {
	getListItems,
	searchAndReplaceLineInFile,
} from '../helpers/files/util';
import { Taskey } from '../helpers/tasks/types';
import { updateMetadata } from '../helpers/tasks/util';
import { selectFilesMap, selectObsidian } from '../store/atoms/files';
import { TaskType } from '../types/Task';

export function useFileManager() {
	const obsidian = useAtomValue(selectObsidian);
	const filesMap = useAtomValue(selectFilesMap);

	const replaceLineInFile = async () => {
		// const fileRef = obsidian.app.vault.getAbstractFileByPath(filePath) as TFile;
		// const fileContent = await obsidian.app.vault.read(fileRef);
		// const fileLines = fileContent.split('\n');
		// fileLines[line] = replace;
		// return obsidian.app.vault.modify(fileRef, fileLines.join('\n'));
	};

	const toggleTaskStatus = async (task: Taskey) => {
		const currentMarker = task.done ? '[x]' : '[ ]';
		const nextMarker = task.done ? '[ ]' : '[x]';
		let newTask = task.originalText.replace(currentMarker, nextMarker);

		// Add or remove completedOn metadata
		if (!task.done) {
			// Completing the task - add completedOn with today's date
			newTask = updateMetadata(newTask, 'completedOn', today());
		} else {
			// Uncompleting the task - remove completedOn metadata
			const pattern = /\s*\{completedOn:[^}]+\}/gi;
			newTask = newTask.replace(pattern, '');
		}

		const file = filesMap.get(task.filePath);
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			task.filePath
		) as TFile;

		if (file) {
			const lines = file.data.content.split('\n');
			lines[task.data.line] = newTask;
			return obsidian.app.vault.modify(fileRef, lines.join('\n'));
		}
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

	const updateTaskMetadata = async (
		task: TaskType,
		key: string,
		value: string
	) => {
		const updatedText = updateMetadata(task.originalText, key, value);

		await searchAndReplaceLineInFile(
			obsidian,
			task.filePath,
			task.line.start,
			task.originalText,
			updatedText
		);
	};

	const updateDate = async (task: TaskType, date: string) => {
		await updateTaskMetadata(task, 'due', date);
	};

	const updateTaskeyDate = async (task: Taskey, date: string) => {
		const updatedText = updateMetadata(task.originalText, 'due', date);
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			task.filePath
		) as TFile;
		const file = filesMap.get(task.filePath);

		if (file) {
			const lines = file.data.content.split('\n');
			lines[task.data.line] = updatedText;
			return obsidian.app.vault.modify(fileRef, lines.join('\n'));
		}
	};

	const addTaskToFile = async (filePath: string, text: string) => {
		const fileRef = obsidian.app.vault.getAbstractFileByPath(filePath) as TFile;
		const fileContent = await obsidian.app.vault.read(fileRef);
		const lines = fileContent.split('\n');

		const listItems = getListItems(obsidian, fileRef);
		const taskItems = listItems.filter((item) => Object.hasOwn(item, 'task'));

		const newLine = `- [ ] ${text}`;
		if (taskItems.length > 0) {
			const lastTask = taskItems[taskItems.length - 1];
			lines.splice(lastTask.position.end.line + 1, 0, newLine);
		} else {
			lines.push(newLine);
		}

		return obsidian.app.vault.modify(fileRef, lines.join('\n'));
	};

	const updateTaskText = async (task: Taskey, newText: string) => {
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			task.filePath
		) as TFile;
		const file = filesMap.get(task.filePath);

		if (file) {
			const lines = file.data.content.split('\n');
			lines[task.data.line] = newText;
			return obsidian.app.vault.modify(fileRef, lines.join('\n'));
		}
	};

	return {
		addTaskToFile,
		toggleTaskStatus,
		updateTask,
		updateDate,
		updateTaskeyDate,
		updateTaskText,
	};
}
