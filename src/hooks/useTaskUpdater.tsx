import { useAtomValue } from 'jotai';
import { searchAndReplaceLineInFile } from '../helpers/files';
import { updateMetadata } from '../helpers/tasks';
import { selectObsidian } from '../store/atoms/files';
import { TaskType } from '../types/Task';

export function useTaskManager() {
	const obsidian = useAtomValue(selectObsidian);

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

	return {
		updateDate,
	};
}
