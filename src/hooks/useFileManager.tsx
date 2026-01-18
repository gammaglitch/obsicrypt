import { useAtomValue } from 'jotai';
import { TFile } from 'obsidian';

import { getListItems } from '../helpers/files/util';
import { Taskey } from '../helpers/tasks/types';
import {
	insertTaskIntoLines,
	replaceLineContent,
	replaceTaskLine,
	toggleTaskLine,
} from '../helpers/tasks/transforms';
import { updateTaskLineMetadata } from '../helpers/tasks/util';
import { selectFilesMap, selectObsidian } from '../store/atoms/files';
import { TaskType } from '../types/Task';

export function useFileManager() {
	const obsidian = useAtomValue(selectObsidian);
	const filesMap = useAtomValue(selectFilesMap);

	const toggleTaskStatus = async (task: Taskey) => {
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

	const updateTask = async (task: TaskType, text: string) => {
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
		task: TaskType,
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

	const updateDate = async (task: TaskType, date: string) => {
		await updateTaskMetadata(task, 'due', date);
	};

	const updateTaskeyMetadata = async (
		task: Taskey,
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

	const updateTaskeyDate = async (task: Taskey, date: string) => {
		return updateTaskeyMetadata(task, 'due', date);
	};

	const addTaskToFile = async (filePath: string, text: string) => {
		const fileRef = obsidian.app.vault.getAbstractFileByPath(filePath) as TFile;
		const fileContent = await obsidian.app.vault.read(fileRef);

		const listItems = getListItems(obsidian, fileRef);
		const taskItems = listItems.filter((item) => Object.hasOwn(item, 'task'));

		const newContent = insertTaskIntoLines(fileContent, taskItems, text);
		return obsidian.app.vault.modify(fileRef, newContent);
	};

	const updateTaskText = async (task: Taskey, newText: string) => {
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
		updateTaskeyMetadata,
		updateTask,
		updateDate,
		updateTaskeyDate,
		updateTaskText,
	};
}
