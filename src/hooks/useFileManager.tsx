import { useAtomValue } from 'jotai';

import {
	replaceLineInFile,
	searchAndReplaceLineInFile,
} from '../helpers/files';
import { updateMetadata } from '../helpers/tasks';
import { selectObsidian } from '../store/atoms/files';
import { TaskType } from '../types/Task';

export function useFileManager() {
	const obsidian = useAtomValue(selectObsidian);

	const toggleTaskStatus = async (task: TaskType) => {
		let newTask;

		if (task.isComplete) {
			newTask = task.originalText.replace('[x]', '[ ]');
		} else {
			newTask = task.originalText.replace('[ ]', '[x]');
		}

		await replaceLineInFile(obsidian, task.filePath, task.line.start, newTask);
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
