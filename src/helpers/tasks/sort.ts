import { StoredTask } from './types';

export type SortOption = 'default' | 'due' | 'priority' | 'name' | 'status';

const priorityOrder: Record<string, number> = {
	'1': 1,
	'2': 2,
	'3': 3,
	'4': 4,
};

function getPriority(task: StoredTask): number {
	const p = task.custom?.priority?.[0];

	return priorityOrder[p] ?? 5;
}

export function sortTasks(tasks: StoredTask[], sort: SortOption): StoredTask[] {
	if (sort === 'default') {
		return tasks;
	}

	return [...tasks].sort((a, b) => {
		switch (sort) {
			case 'due': {
				if (!a.due && !b.due) {
					return 0;
				}

				if (!a.due) {
					return 1;
				}

				if (!b.due) {
					return -1;
				}

				return a.due.localeCompare(b.due);
			}

			case 'priority': {
				return getPriority(a) - getPriority(b);
			}
			case 'name': {
				return a.displayText.localeCompare(b.displayText);
			}

			case 'status': {
				if (a.done === b.done) {
					return 0;
				}

				return a.done ? 1 : -1;
			}

			default: {
				return 0;
			}
		}
	});
}
