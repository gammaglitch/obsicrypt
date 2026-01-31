import { sortTasks, SortOption } from './sort';
import { StoredTask } from './types';

function makeTask(overrides: Partial<StoredTask> = {}): StoredTask {
	return {
		text: '',
		displayText: '',
		originalText: '',
		done: false,
		filePath: '',
		data: { line: 0 },
		due: null,
		start: null,
		completedOn: null,
		tags: [],
		contexts: [],
		custom: {},
		...overrides,
	};
}

describe('sortTasks', () => {
	it('returns tasks as-is for default sort', () => {
		const tasks = [
			makeTask({ displayText: 'b' }),
			makeTask({ displayText: 'a' }),
		];
		const result = sortTasks(tasks, 'default');
		expect(result[0].displayText).toBe('b');
	});

	it('does not mutate the original array', () => {
		const tasks = [
			makeTask({ displayText: 'b' }),
			makeTask({ displayText: 'a' }),
		];
		sortTasks(tasks, 'name');
		expect(tasks[0].displayText).toBe('b');
	});

	describe('sort by name', () => {
		it('sorts alphabetically', () => {
			const tasks = [
				makeTask({ displayText: 'Charlie' }),
				makeTask({ displayText: 'Alpha' }),
				makeTask({ displayText: 'Bravo' }),
			];
			const result = sortTasks(tasks, 'name');
			expect(result.map((t) => t.displayText)).toEqual([
				'Alpha',
				'Bravo',
				'Charlie',
			]);
		});
	});

	describe('sort by due', () => {
		it('sorts by due date ascending', () => {
			const tasks = [
				makeTask({ due: '2024-12-15' }),
				makeTask({ due: '2024-12-01' }),
				makeTask({ due: '2024-12-10' }),
			];
			const result = sortTasks(tasks, 'due');
			expect(result.map((t) => t.due)).toEqual([
				'2024-12-01',
				'2024-12-10',
				'2024-12-15',
			]);
		});

		it('pushes tasks without due date to the end', () => {
			const tasks = [makeTask({ due: null }), makeTask({ due: '2024-12-01' })];
			const result = sortTasks(tasks, 'due');
			expect(result[0].due).toBe('2024-12-01');
			expect(result[1].due).toBeNull();
		});
	});

	describe('sort by priority', () => {
		it('sorts by priority number ascending', () => {
			const tasks = [
				makeTask({ custom: { priority: ['3'] } }),
				makeTask({ custom: { priority: ['1'] } }),
				makeTask({ custom: { priority: ['2'] } }),
			];
			const result = sortTasks(tasks, 'priority');
			expect(result.map((t) => t.custom.priority[0])).toEqual(['1', '2', '3']);
		});

		it('tasks without priority sort last', () => {
			const tasks = [
				makeTask({ custom: {} }),
				makeTask({ custom: { priority: ['1'] } }),
			];
			const result = sortTasks(tasks, 'priority');
			expect(result[0].custom.priority[0]).toBe('1');
		});
	});

	describe('sort by status', () => {
		it('puts incomplete tasks before completed ones', () => {
			const tasks = [makeTask({ done: true }), makeTask({ done: false })];
			const result = sortTasks(tasks, 'status');
			expect(result[0].done).toBe(false);
			expect(result[1].done).toBe(true);
		});
	});
});
