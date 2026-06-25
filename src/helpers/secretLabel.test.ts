import { formatSecretFence, parseSecretLabel } from './secretLabel';

describe('parseSecretLabel', () => {
	it('returns null when there is no label', () => {
		expect(parseSecretLabel('secret')).toBeNull();
		expect(parseSecretLabel('')).toBeNull();
	});

	it('extracts a label from the fence info string', () => {
		expect(parseSecretLabel('secret name="STRIPE_KEY"')).toBe('STRIPE_KEY');
	});

	it('works regardless of surrounding fence text', () => {
		expect(parseSecretLabel('```secret name="DB_URL"')).toBe('DB_URL');
		expect(parseSecretLabel(' name="DB_URL"')).toBe('DB_URL');
	});

	it('trims whitespace inside the label', () => {
		expect(parseSecretLabel('secret name="  API_KEY  "')).toBe('API_KEY');
	});

	it('treats an empty label as absent', () => {
		expect(parseSecretLabel('secret name=""')).toBeNull();
		expect(parseSecretLabel('secret name="   "')).toBeNull();
	});
});

describe('formatSecretFence', () => {
	it('returns a bare fence when there is no label', () => {
		expect(formatSecretFence()).toBe('secret');
		expect(formatSecretFence(null)).toBe('secret');
		expect(formatSecretFence('')).toBe('secret');
		expect(formatSecretFence('   ')).toBe('secret');
	});

	it('embeds a label', () => {
		expect(formatSecretFence('STRIPE_KEY')).toBe('secret name="STRIPE_KEY"');
	});

	it('strips quotes and newlines that would break the fence', () => {
		expect(formatSecretFence('a"b\nc')).toBe('secret name="abc"');
	});

	it('round-trips with parseSecretLabel', () => {
		expect(parseSecretLabel(formatSecretFence('MY_TOKEN'))).toBe('MY_TOKEN');
	});
});
