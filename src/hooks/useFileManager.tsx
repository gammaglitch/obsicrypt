import { useAtomValue } from 'jotai';
import { TFile } from 'obsidian';

import { searchAndReplaceLineInFile } from '../helpers/files/util';
import { Taskey } from '../helpers/tasks/types';
import { updateMetadata } from '../helpers/tasks/util';
import {
	allDataAtom,
	filesAtom,
	selectFilesMap,
	selectObsidian,
} from '../store/atoms/files';
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
		let newTask;

		if (task.done) {
			newTask = task.text.replace('[x]', '[ ]');
		} else {
			newTask = task.text.replace('[ ]', '[x]');
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

	return { toggleTaskStatus, updateTask, updateDate };
}
