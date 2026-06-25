import {
	buildEncryptedNote,
	isWholeNoteEncrypted,
	parseFrontmatter,
	readEncryptedNote,
} from './wholeNote';

const ENVELOPE = 'obsicrypt:v1|c2FsdA==|aXY=|Y3Q=';

describe('parseFrontmatter', () => {
	it('returns null when there is no frontmatter', () => {
		expect(parseFrontmatter('# Title\n\ntext')).toBeNull();
	});

	it('parses flat key: value pairs and the body', () => {
		const fm = parseFrontmatter('---\nkey: value\nobsicrypt: encrypted\n---\nbody line');
		expect(fm).toEqual({
			map: { key: 'value', obsicrypt: 'encrypted' },
			body: 'body line',
		});
	});

	it('returns null for an unterminated frontmatter block', () => {
		expect(parseFrontmatter('---\nkey: value\nno closing fence')).toBeNull();
	});
});

describe('buildEncryptedNote', () => {
	it('wraps an envelope with the flag frontmatter', () => {
		expect(buildEncryptedNote(ENVELOPE)).toBe(
			`---\nobsicrypt: encrypted\n---\n${ENVELOPE}\n`
		);
	});
});

describe('readEncryptedNote', () => {
	it('round-trips with buildEncryptedNote', () => {
		const result = readEncryptedNote(buildEncryptedNote(ENVELOPE));
		expect(result).toEqual({ flagged: true, envelope: ENVELOPE });
	});

	it('is not flagged for a plain note', () => {
		expect(readEncryptedNote('# Title\n\njust text')).toEqual({
			flagged: false,
			envelope: null,
		});
	});

	it('is not flagged for unrelated frontmatter', () => {
		expect(readEncryptedNote('---\ntags: a\n---\nbody')).toEqual({
			flagged: false,
			envelope: null,
		});
	});

	it('reports flagged but null envelope when the body is empty', () => {
		expect(readEncryptedNote('---\nobsicrypt: encrypted\n---\n')).toEqual({
			flagged: true,
			envelope: null,
		});
	});

	it('ignores inline secret blocks (does not treat them as whole-note)', () => {
		const inline = 'intro\n\n```secret\nobsicrypt:v1|a|b|c\n```\n\nmore';
		expect(readEncryptedNote(inline).flagged).toBe(false);
	});
});

describe('isWholeNoteEncrypted', () => {
	it('is true for a flagged note', () => {
		expect(isWholeNoteEncrypted(buildEncryptedNote(ENVELOPE))).toBe(true);
	});

	it('is false for plain text', () => {
		expect(isWholeNoteEncrypted('not locked')).toBe(false);
	});
});
