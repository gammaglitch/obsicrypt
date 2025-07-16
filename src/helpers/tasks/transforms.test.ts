import {
	toggleTaskLine,
	replaceTaskLine,
	insertTaskIntoLines,
	replaceLineContent,
} from './transforms';

jest.mock('../dates', () => ({
	today: () => '2024-12-15',
}));

describe('toggleTaskLine', () => {
	it('completes an incomplete task', () => {
		const result = toggleTaskLine('- [ ] Buy milk', false);
		expect(result).toBe('- [x] Buy milk {completedOn:2024-12-15}');
	});

	it('uncompletes a completed task and removes completedOn', () => {
		const result = toggleTaskLine(
			'- [x] Buy milk {completedOn:2024-12-10}',
			true
		);
		expect(result).toBe('- [ ] Buy milk');
	});

	it('preserves existing metadata when completing', () => {
		const result = toggleTaskLine('- [ ] Buy milk {due:2024-12-20}', false);
		expect(result).toBe(
			'- [x] Buy milk {due:2024-12-20} {completedOn:2024-12-15}'
		);
	});

	it('preserves existing metadata when uncompleting', () => {
		const result = toggleTaskLine(
			'- [x] Buy milk {due:2024-12-20} {completedOn:2024-12-10}',
			true
		);
		expect(result).toBe('- [ ] Buy milk {due:2024-12-20}');
	});
});

describe('replaceTaskLine', () => {
	const content = '- [ ] Task one\n- [ ] Task two\n- [ ] Task three';

	it('replaces a specific line', () => {
		const result = replaceTaskLine(content, 1, '- [x] Task two done');
		expect(result).toBe(
			'- [ ] Task one\n- [x] Task two done\n- [ ] Task three'
		);
	});

	it('replaces the first line', () => {
		const result = replaceTaskLine(content, 0, '- [x] Task one done');
		expect(result).toBe(
			'- [x] Task one done\n- [ ] Task two\n- [ ] Task three'
		);
	});

	it('replaces the last line', () => {
		const result = replaceTaskLine(content, 2, '- [x] Task three done');
		expect(result).toBe(
			'- [ ] Task one\n- [ ] Task two\n- [x] Task three done'
		);
	});
});

describe('insertTaskIntoLines', () => {
	it('inserts after the last task', () => {
		const content = '# My tasks\n- [ ] First task\n- [ ] Second task';
		const taskItems = [
			{ position: { end: { line: 1 } } },
			{ position: { end: { line: 2 } } },
		];
		const result = insertTaskIntoLines(content, taskItems, 'New task');
		expect(result).toBe(
			'# My tasks\n- [ ] First task\n- [ ] Second task\n- [ ] New task'
		);
	});

	it('appends to end when no tasks exist', () => {
		const content = '# My tasks\nSome notes here';
		const result = insertTaskIntoLines(content, [], 'First task');
		expect(result).toBe('# My tasks\nSome notes here\n- [ ] First task');
	});

	it('inserts between tasks and other content', () => {
		const content = '# My tasks\n- [ ] Only task\n\nSome footer text';
		const taskItems = [{ position: { end: { line: 1 } } }];
		const result = insertTaskIntoLines(content, taskItems, 'Second task');
		expect(result).toBe(
			'# My tasks\n- [ ] Only task\n- [ ] Second task\n\nSome footer text'
		);
	});
});

describe('replaceLineContent', () => {
	const content = '# Header\n- [ ] Buy milk and eggs\n- [ ] Call dentist';

	it('replaces matching text on a specific line', () => {
		const result = replaceLineContent(content, 1, 'milk and eggs', 'bread');
		expect(result).toBe('# Header\n- [ ] Buy bread\n- [ ] Call dentist');
	});

	it('does not affect other lines', () => {
		const result = replaceLineContent(content, 1, 'Buy', 'Get');
		const lines = result.split('\n');
		expect(lines[0]).toBe('# Header');
		expect(lines[1]).toBe('- [ ] Get milk and eggs');
		expect(lines[2]).toBe('- [ ] Call dentist');
	});

	it('leaves line unchanged if search not found', () => {
		const result = replaceLineContent(content, 1, 'nonexistent', 'replaced');
		expect(result).toBe(content);
	});
});
