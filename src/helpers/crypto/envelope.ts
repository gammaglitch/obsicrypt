import { base64ToBytes, bytesToBase64 } from './base64';

export class EnvelopeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EnvelopeError';
	}
}

export type EnvelopeParts = {
	salt: Uint8Array;
	iv: Uint8Array;
	ciphertext: Uint8Array;
};

export const ENVELOPE_VERSION_TAG = 'obsikit:v1';

export function format(parts: EnvelopeParts): string {
	return [
		ENVELOPE_VERSION_TAG,
		bytesToBase64(parts.salt),
		bytesToBase64(parts.iv),
		bytesToBase64(parts.ciphertext),
	].join('|');
}

export function parse(source: string): EnvelopeParts {
	const trimmed = source.trim();
	const segments = trimmed.split('|');
	if (segments.length !== 4) {
		throw new EnvelopeError(
			`expected 4 segments, got ${segments.length}`
		);
	}
	const [tag, saltB64, ivB64, ciphertextB64] = segments;
	if (tag !== ENVELOPE_VERSION_TAG) {
		throw new EnvelopeError(`unknown version tag: ${tag}`);
	}
	if (!saltB64 || !ivB64 || !ciphertextB64) {
		throw new EnvelopeError('empty segment');
	}
	try {
		return {
			salt: base64ToBytes(saltB64),
			iv: base64ToBytes(ivB64),
			ciphertext: base64ToBytes(ciphertextB64),
		};
	} catch (err) {
		throw new EnvelopeError(
			`failed to decode base64: ${(err as Error).message}`
		);
	}
}
