import { useAtomValue } from 'jotai';

import { searchAndReplaceLineInFile } from '../helpers/files/util';
import { updateTaskLineMetadata } from '../helpers/tasks/util';
import { selectPlugin } from '../store/atoms/files';
import { ParsedTask } from '../types/Task';

export function useTaskManager() {
	const plugin = useAtomValue(selectPlugin);

	const updateTaskMetadata = async (
		task: ParsedTask,
		key: string,
		value: string
	) => {
		const updatedText = updateTaskLineMetadata(task.originalText, key, value);

		await searchAndReplaceLineInFile(
			plugin,
			task.filePath,
			task.line.start,
			task.originalText,
			updatedText
		);
	};

	const updateDate = async (task: ParsedTask, date: string) => {
		await updateTaskMetadata(task, 'due', date);
	};

	return {
		updateDate,
	};
}
