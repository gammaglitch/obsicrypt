import { atom } from 'jotai';
import { loadable, selectAtom } from 'jotai/utils';

import { activeFileAtom, activeTagAtom, filesAtom } from './files';

export const tasksAtom = selectAtom(filesAtom, (data) => [
	...data.tasks.values(),
]);

export const loadableTasks = loadable(tasksAtom);

export const activeFileTasksAtom = atom(async (get) => {
	const file = get(activeFileAtom);
	const { tasks } = get(filesAtom);

	if (file) {
		return tasks.get(file.name) ?? [];
	}

	return [];
});

export const loadableCurrTasks = loadable(activeFileTasksAtom);

export const activeTagTasksAtom = atom(async (get) => {
	const tag = get(activeTagAtom);
	const { tasks } = get(filesAtom);

	if (tag) {
		const allTasks = [...tasks.values()].flat();
		return allTasks.filter((task) => task.tags.includes(tag));
	}

	return [];
});

export const loadableTagTasks = loadable(activeTagTasksAtom);
