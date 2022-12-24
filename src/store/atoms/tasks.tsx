import { atom } from 'jotai';
import { loadable, selectAtom } from 'jotai/utils';

import { getTasksFromFiles } from '../../helpers/files';
import { activeFileAtom, filesAtom } from './files';

export const tasksAtom = selectAtom(filesAtom, (data) => [
	...data.tasks.values(),
]);

export const loadableTasks = loadable(tasksAtom);

export const activeFileTasksAtom = atom((get) => {
	const file = get(activeFileAtom);
	const { tasks } = get(filesAtom);

	if (file) {
		return tasks.get(file.name);
	}

	return [];
});

export const loadableCurrTasks = loadable(activeFileTasksAtom);
