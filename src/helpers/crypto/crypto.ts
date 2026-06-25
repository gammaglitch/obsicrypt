import { base64ToBytes, bytesToBase64 } from './base64';
import { EnvelopeParts } from './envelope';

const PBKDF2_ITERATIONS = 600_000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const VERIFIER_PLAINTEXT = 'obsicrypt-verify-v1';

/**
 * Derive the AES-GCM key from a password + salt (PBKDF2, 600k, SHA-256). This is
 * the expensive step; callers that re-encrypt repeatedly (e.g. the memory-only
 * editor) should derive once and reuse the key via encryptWithKey/decryptWithKey.
 */
export async function deriveKey(
	password: string,
	salt: Uint8Array
): Promise<CryptoKey> {
	const material = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	);
	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			hash: 'SHA-256',
			salt,
			iterations: PBKDF2_ITERATIONS,
		},
		material,
		{ name: 'AES-GCM', length: KEY_LENGTH },
		false,
		['encrypt', 'decrypt']
	);
}

/**
 * Encrypt with an already-derived key. Generates a fresh IV but REUSES the
 * caller's salt, so the on-disk salt (and therefore the cached key) stays valid
 * across re-encryptions. No PBKDF2 — cheap enough to run on every save.
 */
export async function encryptWithKey(
	plaintext: string,
	key: CryptoKey,
	salt: Uint8Array
): Promise<EnvelopeParts> {
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		new TextEncoder().encode(plaintext)
	);
	return { salt, iv, ciphertext: new Uint8Array(ciphertext) };
}

/** Decrypt with an already-derived key. The GCM auth tag is the wrong-key check. */
export async function decryptWithKey(
	parts: EnvelopeParts,
	key: CryptoKey
): Promise<string> {
	const buffer = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: parts.iv },
		key,
		parts.ciphertext
	);
	return new TextDecoder().decode(buffer);
}

export async function encryptString(
	plaintext: string,
	password: string
): Promise<EnvelopeParts> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const key = await deriveKey(password, salt);
	return encryptWithKey(plaintext, key, salt);
}

export async function decryptString(
	parts: EnvelopeParts,
	password: string
): Promise<string> {
	const key = await deriveKey(password, parts.salt);
	return decryptWithKey(parts, key);
}

/**
 * Encrypt fresh content and return BOTH the envelope parts and the derived key,
 * so callers can cache the key (e.g. to open a newly created note already
 * unlocked) without re-running PBKDF2.
 */
export async function createEncrypted(
	plaintext: string,
	password: string
): Promise<{ parts: EnvelopeParts; key: CryptoKey }> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const key = await deriveKey(password, salt);
	const parts = await encryptWithKey(plaintext, key, salt);
	return { parts, key };
}

export type Verifier = {
	saltB64: string;
	ivB64: string;
	ciphertextB64: string;
};

export async function makeVerifier(password: string): Promise<Verifier> {
	const parts = await encryptString(VERIFIER_PLAINTEXT, password);
	return {
		saltB64: bytesToBase64(parts.salt),
		ivB64: bytesToBase64(parts.iv),
		ciphertextB64: bytesToBase64(parts.ciphertext),
	};
}

export async function checkVerifier(
	verifier: Verifier,
	password: string
): Promise<boolean> {
	try {
		const plaintext = await decryptString(
			{
				salt: base64ToBytes(verifier.saltB64),
				iv: base64ToBytes(verifier.ivB64),
				ciphertext: base64ToBytes(verifier.ciphertextB64),
			},
			password
		);
		return plaintext === VERIFIER_PLAINTEXT;
	} catch {
		return false;
	}
}
