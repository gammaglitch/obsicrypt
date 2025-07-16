import { matchGlob } from './glob';

describe('matchGlob', () => {
	it('matches exact paths', () => {
		expect(matchGlob('inbox/tasks.md', 'inbox/tasks.md')).toBe(true);
		expect(matchGlob('inbox/tasks.md', 'inbox/other.md')).toBe(false);
	});

	it('matches single wildcard', () => {
		expect(matchGlob('inbox/*.md', 'inbox/tasks.md')).toBe(true);
		expect(matchGlob('inbox/*.md', 'inbox/notes.md')).toBe(true);
		expect(matchGlob('inbox/*.md', 'inbox/deep/tasks.md')).toBe(false);
	});

	it('matches double wildcard for recursive paths', () => {
		expect(matchGlob('inbox/**', 'inbox/tasks.md')).toBe(true);
		expect(matchGlob('inbox/**', 'inbox/deep/tasks.md')).toBe(true);
		expect(matchGlob('inbox/**', 'other/tasks.md')).toBe(false);
	});

	it('matches double wildcard with extension', () => {
		expect(matchGlob('**/*.md', 'inbox/tasks.md')).toBe(true);
		expect(matchGlob('**/*.md', 'a/b/c/file.md')).toBe(true);
		expect(matchGlob('**/*.md', 'file.txt')).toBe(false);
	});

	it('escapes special regex characters in path', () => {
		expect(matchGlob('notes.md', 'notes.md')).toBe(true);
		expect(matchGlob('notes.md', 'notesXmd')).toBe(false);
	});
});
