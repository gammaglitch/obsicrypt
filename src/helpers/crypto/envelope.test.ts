import { EnvelopeError, format, parse } from './envelope';

const fixture = 'obsicrypt:v1|AAECAwQFBgcICQoLDA0ODw==|AAECAwQFBgcICQoL|SGVsbG8=';

describe('envelope format/parse', () => {
	it('round-trips a fixture string', () => {
		expect(format(parse(fixture))).toBe(fixture);
	});

	it('tolerates surrounding whitespace and newlines', () => {
		const padded = `\n  ${fixture}\n\n`;
		expect(format(parse(padded))).toBe(fixture);
	});

	it('rejects missing version tag', () => {
		expect(() => parse('AAA|BBB|CCC')).toThrow(EnvelopeError);
	});

	it('rejects wrong version tag', () => {
		expect(() =>
			parse('obsicrypt:v2|AAA=|BBB=|CCC=')
		).toThrow(EnvelopeError);
	});

	it('rejects wrong segment count', () => {
		expect(() =>
			parse('obsicrypt:v1|AAA=|BBB=')
		).toThrow(EnvelopeError);
		expect(() =>
			parse('obsicrypt:v1|AAA=|BBB=|CCC=|DDD=')
		).toThrow(EnvelopeError);
	});

	it('rejects non-base64 segments', () => {
		expect(() =>
			parse('obsicrypt:v1|not base64!|BBB=|CCC=')
		).toThrow(EnvelopeError);
	});

	it('rejects empty segments', () => {
		expect(() => parse('obsicrypt:v1|||')).toThrow(EnvelopeError);
	});
});
