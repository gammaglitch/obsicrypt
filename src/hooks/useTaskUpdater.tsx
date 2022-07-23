import { searchAndReplaceLineInFile } from '../helpers/files';
import { updateMetadata } from '../helpers/tasks';
import useStore from '../store/store';
import { TaskType } from '../types/Task';

export function useTaskManager() {
	const { obsidian } = useStore();

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
