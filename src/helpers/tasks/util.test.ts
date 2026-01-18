import {
	clearTaskLineMetadata,
	parseTaskContent,
	parseTaskLine,
	stripTaskCheckbox,
	updateMetadata,
	updateTaskLineMetadata,
} from './util';

describe('stripTaskCheckbox', () => {
	it('strips unchecked checkbox', () => {
		expect(stripTaskCheckbox('- [ ] Buy milk')).toBe('Buy milk');
	});

	it('strips checked checkbox', () => {
		expect(stripTaskCheckbox('- [x] Buy milk')).toBe('Buy milk');
	});

	it('strips uppercase X checkbox', () => {
		expect(stripTaskCheckbox('- [X] Buy milk')).toBe('Buy milk');
	});

	it('strips asterisk list marker', () => {
		expect(stripTaskCheckbox('* [ ] Buy milk')).toBe('Buy milk');
	});

	it('returns text as-is without checkbox', () => {
		expect(stripTaskCheckbox('Buy milk')).toBe('Buy milk');
	});
});

describe('parseTaskContent', () => {
	it('extracts due date from braced metadata', () => {
		const result = parseTaskContent('- [ ] Buy milk {due:2024-12-15}');
		expect(result.metadata.due).toBe('2024-12-15');
		expect(result.displayText).toBe('Buy milk');
	});

	it('extracts multiple metadata fields', () => {
		const result = parseTaskContent(
			'- [ ] Task {due:2024-12-15} {start:2024-12-01}'
		);
		expect(result.metadata.due).toBe('2024-12-15');
		expect(result.metadata.start).toBe('2024-12-01');
	});

	it('extracts tags', () => {
		const result = parseTaskContent('- [ ] Buy milk #groceries #errands');
		expect(result.metadata.tags).toEqual(['groceries', 'errands']);
	});

	it('extracts contexts', () => {
		const result = parseTaskContent('- [ ] Call dentist @phone @health');
		expect(result.metadata.contexts).toEqual(['phone', 'health']);
	});

	it('extracts custom key-value pairs', () => {
		const result = parseTaskContent('- [ ] Task {priority:1}');
		expect(result.metadata.custom.priority).toEqual(['1']);
	});

	it('handles task with all metadata types', () => {
		const result = parseTaskContent(
			'- [ ] Big task {due:2024-12-15} {priority:2} #work @office'
		);
		expect(result.metadata.due).toBe('2024-12-15');
		expect(result.metadata.custom.priority).toEqual(['2']);
		expect(result.metadata.tags).toEqual(['work']);
		expect(result.metadata.contexts).toEqual(['office']);
		expect(result.displayText).toBe('Big task');
	});

	it('handles plain task with no metadata', () => {
		const result = parseTaskContent('- [ ] Just a simple task');
		expect(result.metadata.due).toBeNull();
		expect(result.metadata.tags).toEqual([]);
		expect(result.metadata.contexts).toEqual([]);
		expect(result.displayText).toBe('Just a simple task');
	});

	it('deduplicates tags', () => {
		const result = parseTaskContent('- [ ] Task #work #work');
		expect(result.metadata.tags).toEqual(['work']);
	});

	it('deduplicates contexts case-insensitively', () => {
		const result = parseTaskContent('- [ ] Task @Office @office');
		expect(result.metadata.contexts).toEqual(['Office']);
	});

	it('normalizes whitespace in display text', () => {
		const result = parseTaskContent('- [ ] Buy   milk   today');
		expect(result.displayText).toBe('Buy milk today');
	});
});

describe('parseTaskLine', () => {
	it('returns structured task-line data for serializer-backed edits', () => {
		expect(
			parseTaskLine('- [x] Plan sprint {due:2024-12-15} #work @desk')
		).toEqual({
			text: 'Plan sprint',
			displayText: 'Plan sprint',
			originalText: '- [x] Plan sprint {due:2024-12-15} #work @desk',
			isComplete: true,
			due: '2024-12-15',
			start: null,
			completedOn: null,
			tags: ['work'],
			contexts: ['desk'],
			custom: {},
		});
	});
});

describe('updateMetadata', () => {
	it('updates existing metadata value', () => {
		const result = updateMetadata(
			'Buy milk {due:2024-12-01}',
			'due',
			'2024-12-15'
		);
		expect(result).toBe('Buy milk {due:2024-12-15}');
	});

	it('appends metadata if key does not exist', () => {
		const result = updateMetadata('Buy milk', 'due', '2024-12-15');
		expect(result).toBe('Buy milk {due:2024-12-15}');
	});

	it('matches keys case-insensitively', () => {
		const result = updateMetadata('Task {Due:2024-12-01}', 'due', '2024-12-15');
		expect(result).toBe('Task {Due:2024-12-15}');
	});

	it('handles empty string', () => {
		const result = updateMetadata('', 'due', '2024-12-15');
		expect(result).toBe('{due:2024-12-15}');
	});
});

describe('updateTaskLineMetadata', () => {
	it('updates standard task metadata through parse and serialize', () => {
		const result = updateTaskLineMetadata(
			'- [ ] Buy milk #errands',
			'due',
			'2024-12-15'
		);

		expect(result).toBe('- [ ] Buy milk {due:2024-12-15} #errands');
	});

	it('replaces repeated custom metadata with a single canonical value', () => {
		const result = updateTaskLineMetadata(
			'- [ ] Task {priority:1} {priority:2}',
			'priority',
			'3'
		);

		expect(result).toBe('- [ ] Task {priority:3}');
	});
});

describe('clearTaskLineMetadata', () => {
	it('removes standard metadata through parse and serialize', () => {
		const result = clearTaskLineMetadata(
			'- [x] Buy milk {due:2024-12-15} {completedOn:2024-12-01}',
			'completedOn'
		);

		expect(result).toBe('- [x] Buy milk {due:2024-12-15}');
	});
});
