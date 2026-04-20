import { scanFileForSecrets } from './scanSecrets';

describe('scanFileForSecrets', () => {
	it('returns empty array for notes with no secret blocks', () => {
		expect(scanFileForSecrets('# Heading\n\nJust prose.')).toEqual([]);
	});

	it('finds a single secret block', () => {
		const content = '# Note\n\n```secret\nobsicrypt:v1|a|b|c\n```\n';
		expect(scanFileForSecrets(content)).toEqual([
			{ index: 0, envelope: 'obsicrypt:v1|a|b|c' },
		]);
	});

	it('finds multiple secret blocks in order', () => {
		const content = [
			'```secret',
			'obsicrypt:v1|a|b|c',
			'```',
			'',
			'prose',
			'',
			'```secret',
			'obsicrypt:v1|x|y|z',
			'```',
		].join('\n');
		expect(scanFileForSecrets(content)).toEqual([
			{ index: 0, envelope: 'obsicrypt:v1|a|b|c' },
			{ index: 1, envelope: 'obsicrypt:v1|x|y|z' },
		]);
	});

	it('ignores non-secret fenced blocks', () => {
		const content = [
			'```ts',
			'const x = 1;',
			'```',
			'',
			'```bash',
			'echo hi',
			'```',
		].join('\n');
		expect(scanFileForSecrets(content)).toEqual([]);
	});

	it('tolerates surrounding blank lines inside the block', () => {
		const content = '```secret\n\nobsicrypt:v1|a|b|c\n\n```';
		expect(scanFileForSecrets(content)).toEqual([
			{ index: 0, envelope: 'obsicrypt:v1|a|b|c' },
		]);
	});

	it('returns the raw body even when it is not a valid envelope', () => {
		const content = '```secret\ngarbage\n```';
		expect(scanFileForSecrets(content)).toEqual([
			{ index: 0, envelope: 'garbage' },
		]);
	});
});
