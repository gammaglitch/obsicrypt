import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { getTasksFromFiles } from '../../helpers/files';
import { activeFileAtom, filesAtom } from './files';

export const tasksAtom = atom(async (get) => {
	const files = get(filesAtom);

	if (files) {
		return getTasksFromFiles(files);
	} else {
		return [];
	}
});

export const loadableTasks = loadable(tasksAtom);

export const activeFileTasksAtom = atom((get) => {
	const file = get(activeFileAtom);

	return get(tasksAtom).filter((t) => t.filePath === file?.path);
});

export const loadableCurrTasks = loadable(activeFileTasksAtom);
