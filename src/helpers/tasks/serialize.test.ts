import { serializeTaskLine } from './serialize';
import { parseTaskContent } from './util';

describe('serializeTaskLine', () => {
	it('serializes a plain incomplete task', () => {
		expect(
			serializeTaskLine({
				text: 'Buy milk',
				isComplete: false,
				due: null,
				start: null,
				completedOn: null,
				tags: [],
				contexts: [],
				custom: {},
			})
		).toBe('- [ ] Buy milk');
	});

	it('preserves list marker from the original text', () => {
		expect(
			serializeTaskLine({
				text: 'Review PR',
				isComplete: true,
				originalText: '  * [ ] Review PR',
				due: null,
				start: null,
				completedOn: null,
				tags: [],
				contexts: [],
				custom: {},
			})
		).toBe('  * [x] Review PR');
	});

	it('keeps metadata in a canonical order', () => {
		expect(
			serializeTaskLine({
				text: 'Plan sprint',
				isComplete: true,
				due: '2024-12-20',
				start: '2024-12-10',
				completedOn: '2024-12-15',
				tags: ['work'],
				contexts: ['desk'],
				custom: {
					priority: ['1'],
					energy: ['high'],
				},
			})
		).toBe(
			'- [x] Plan sprint {due:2024-12-20} {start:2024-12-10} {completedOn:2024-12-15} {priority:1} {energy:high} #work @desk'
		);
	});
});

describe('task format round-trip', () => {
	it('parses a serialized task back into the same structure', () => {
		const original = {
			text: 'Plan sprint',
			isComplete: false,
			due: '2024-12-20',
			start: '2024-12-10',
			completedOn: null,
			tags: ['work', 'planning'],
			contexts: ['desk'],
			custom: {
				priority: ['1'],
				energy: ['high'],
			},
		};

		const serialized = serializeTaskLine(original);
		const parsed = parseTaskContent(serialized);

		expect(parsed.displayText).toBe(original.text);
		expect(parsed.metadata).toEqual({
			due: original.due,
			start: original.start,
			completedOn: original.completedOn,
			tags: original.tags,
			contexts: original.contexts,
			custom: original.custom,
		});
	});
});
