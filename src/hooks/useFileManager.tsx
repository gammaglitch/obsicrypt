import { useAtomValue } from 'jotai';
import { TFile } from 'obsidian';

import { getListItems } from '../helpers/files/util';
import { StoredTask } from '../helpers/tasks/types';
import {
	insertTaskIntoLines,
	replaceLineContent,
	replaceTaskLine,
	toggleTaskLine,
} from '../helpers/tasks/transforms';
import { updateTaskLineMetadata } from '../helpers/tasks/util';
import { selectFilesMap, selectObsidian } from '../store/atoms/files';
import { ParsedTask } from '../types/Task';

export function useFileManager() {
	const obsidian = useAtomValue(selectObsidian);
	const filesMap = useAtomValue(selectFilesMap);

	const toggleTaskStatus = async (task: StoredTask) => {
		const newText = toggleTaskLine(task.originalText, task.done);
		const file = filesMap.get(task.filePath);
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			task.filePath
		) as TFile;

		if (file) {
			const newContent = replaceTaskLine(
				file.data.content,
				task.data.line,
				newText
			);
			return obsidian.app.vault.modify(fileRef, newContent);
		}
	};

	const updateTask = async (task: ParsedTask, text: string) => {
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			task.filePath
		) as TFile;
		const fileContent = await obsidian.app.vault.read(fileRef);
		const newContent = replaceLineContent(
			fileContent,
			task.line.start,
			task.text,
			text
		);
		return obsidian.app.vault.modify(fileRef, newContent);
	};

	const updateTaskMetadata = async (
		task: ParsedTask,
		key: string,
		value: string
	) => {
		const updatedText = updateTaskLineMetadata(task.originalText, key, value);
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			task.filePath
		) as TFile;
		const fileContent = await obsidian.app.vault.read(fileRef);
		const newContent = replaceLineContent(
			fileContent,
			task.line.start,
			task.originalText,
			updatedText
		);
		return obsidian.app.vault.modify(fileRef, newContent);
	};

	const updateDate = async (task: ParsedTask, date: string) => {
		await updateTaskMetadata(task, 'due', date);
	};

	const updateStoredTaskMetadata = async (
		task: StoredTask,
		key: string,
		value: string
	) => {
		const updatedText = updateTaskLineMetadata(task.originalText, key, value);
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			task.filePath
		) as TFile;
		const file = filesMap.get(task.filePath);

		if (file) {
			const newContent = replaceTaskLine(
				file.data.content,
				task.data.line,
				updatedText
			);
			return obsidian.app.vault.modify(fileRef, newContent);
		}
	};

	const updateStoredTaskDate = async (task: StoredTask, date: string) => {
		return updateStoredTaskMetadata(task, 'due', date);
	};

	const addTaskToFile = async (filePath: string, text: string) => {
		const fileRef = obsidian.app.vault.getAbstractFileByPath(filePath) as TFile;
		const fileContent = await obsidian.app.vault.read(fileRef);

		const listItems = getListItems(obsidian, fileRef);
		const taskItems = listItems.filter((item) => Object.hasOwn(item, 'task'));

		const newContent = insertTaskIntoLines(fileContent, taskItems, text);
		return obsidian.app.vault.modify(fileRef, newContent);
	};

	const updateTaskText = async (task: StoredTask, newText: string) => {
		const fileRef = obsidian.app.vault.getAbstractFileByPath(
			task.filePath
		) as TFile;
		const file = filesMap.get(task.filePath);

		if (file) {
			const newContent = replaceTaskLine(
				file.data.content,
				task.data.line,
				newText
			);
			return obsidian.app.vault.modify(fileRef, newContent);
		}
	};

	return {
		addTaskToFile,
		toggleTaskStatus,
		updateStoredTaskMetadata,
		updateTask,
		updateDate,
		updateStoredTaskDate,
		updateTaskText,
	};
}
