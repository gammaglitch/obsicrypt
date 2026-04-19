import { base64ToBytes, bytesToBase64 } from './base64';
import { EnvelopeParts } from './envelope';

const PBKDF2_ITERATIONS = 600_000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const VERIFIER_PLAINTEXT = 'obsikit-verify-v1';

async function deriveKey(
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

export async function encryptString(
	plaintext: string,
	password: string
): Promise<EnvelopeParts> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
	const key = await deriveKey(password, salt);
	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		new TextEncoder().encode(plaintext)
	);
	return { salt, iv, ciphertext: new Uint8Array(ciphertext) };
}

export async function decryptString(
	parts: EnvelopeParts,
	password: string
): Promise<string> {
	const key = await deriveKey(password, parts.salt);
	const buffer = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: parts.iv },
		key,
		parts.ciphertext
	);
	return new TextDecoder().decode(buffer);
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
