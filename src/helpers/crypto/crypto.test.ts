import {
	checkVerifier,
	createEncrypted,
	decryptString,
	decryptWithKey,
	deriveKey,
	encryptString,
	encryptWithKey,
	makeVerifier,
} from './crypto';

jest.setTimeout(30000);

describe('encryptString / decryptString', () => {
	it('round-trips ASCII plaintext', async () => {
		const parts = await encryptString('hunter2', 'master');
		const out = await decryptString(parts, 'master');
		expect(out).toBe('hunter2');
	});

	it('round-trips Unicode plaintext', async () => {
		const input = 'héllo 🔒 世界';
		const parts = await encryptString(input, 'correct horse battery staple');
		const out = await decryptString(parts, 'correct horse battery staple');
		expect(out).toBe(input);
	});

	it('throws with wrong password', async () => {
		const parts = await encryptString('secret', 'right');
		await expect(decryptString(parts, 'wrong')).rejects.toThrow();
	});

	it('throws when ciphertext is tampered', async () => {
		const parts = await encryptString('secret', 'pw');
		const tampered = {
			...parts,
			ciphertext: new Uint8Array(parts.ciphertext),
		};
		tampered.ciphertext[0] = tampered.ciphertext[0] ^ 0xff;
		await expect(decryptString(tampered, 'pw')).rejects.toThrow();
	});

	it('produces different ciphertexts for same plaintext and password', async () => {
		const a = await encryptString('same', 'pw');
		const b = await encryptString('same', 'pw');
		expect(Buffer.from(a.ciphertext).equals(Buffer.from(b.ciphertext))).toBe(
			false
		);
	});
});

describe('deriveKey / encryptWithKey / decryptWithKey (key reuse)', () => {
	it('round-trips with a reused key and stable salt, fresh IV each time', async () => {
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const key = await deriveKey('master', salt);

		const a = await encryptWithKey('first version', key, salt);
		const b = await encryptWithKey('second version', key, salt);

		// Same salt carried through; IVs differ so the same key stays usable.
		expect(Buffer.from(a.salt).equals(Buffer.from(salt))).toBe(true);
		expect(Buffer.from(b.salt).equals(Buffer.from(salt))).toBe(true);
		expect(Buffer.from(a.iv).equals(Buffer.from(b.iv))).toBe(false);

		expect(await decryptWithKey(a, key)).toBe('first version');
		expect(await decryptWithKey(b, key)).toBe('second version');
	});

	it('a key derived from the same password + salt decrypts the envelope', async () => {
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const key1 = await deriveKey('pw', salt);
		const parts = await encryptWithKey('payload', key1, salt);

		const key2 = await deriveKey('pw', parts.salt);
		expect(await decryptWithKey(parts, key2)).toBe('payload');
	});

	it('decryptString reads what encryptWithKey wrote (interop)', async () => {
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const key = await deriveKey('pw', salt);
		const parts = await encryptWithKey('shared', key, salt);
		expect(await decryptString(parts, 'pw')).toBe('shared');
	});
});

describe('createEncrypted', () => {
	it('returns parts and a key that decrypt the content', async () => {
		const { parts, key } = await createEncrypted('hello', 'pw');
		expect(await decryptWithKey(parts, key)).toBe('hello');
		// And the password-based path agrees.
		expect(await decryptString(parts, 'pw')).toBe('hello');
	});
});

describe('makeVerifier / checkVerifier', () => {
	it('accepts the correct password', async () => {
		const verifier = await makeVerifier('pw');
		expect(await checkVerifier(verifier, 'pw')).toBe(true);
	});

	it('rejects the wrong password', async () => {
		const verifier = await makeVerifier('pw');
		expect(await checkVerifier(verifier, 'nope')).toBe(false);
	});
});
