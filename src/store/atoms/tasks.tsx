import { atom } from 'jotai';
import { loadable, selectAtom } from 'jotai/utils';

import { config } from '../../config';
import { today } from '../../helpers/dates';
import { matchGlob } from '../../helpers/glob';
import {
	activeDirectoryAtom,
	activeFileAtom,
	activeTagAtom,
	filesAtom,
} from './files';

export const tasksAtom = selectAtom(filesAtom, (data) => [
	...data.tasks.values(),
]);

export const loadableTasks = loadable(tasksAtom);

export const activeFileTasksAtom = atom(async (get) => {
	const file = get(activeFileAtom);
	const { tasks } = get(filesAtom);

	if (file) {
		return tasks.get(file.path) ?? [];
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

export const activeDirectoryTasksAtom = atom(async (get) => {
	const dir = get(activeDirectoryAtom);
	const { tasks } = get(filesAtom);

	if (dir) {
		const allTasks = [...tasks.entries()]
			.filter(([path]) => path.startsWith(`${dir}/`))
			.flatMap(([, tasks]) => tasks);
		return allTasks;
	}

	return [];
});

export const loadableDirectoryTasks = loadable(activeDirectoryTasksAtom);

export const todayTasksAtom = atom(async (get) => {
	const { tasks } = get(filesAtom);
	const allTasks = [...tasks.values()].flat();
	return allTasks.filter((task) => task.due === today());
});

export const loadableTodayTasks = loadable(todayTasksAtom);

export const inboxTasksAtom = atom(async (get) => {
	const { tasks } = get(filesAtom);
	return [...tasks.entries()]
		.filter(([path]) => matchGlob(config.inboxPattern, path))
		.flatMap(([, tasks]) => tasks);
});

export const loadableInboxTasks = loadable(inboxTasksAtom);
