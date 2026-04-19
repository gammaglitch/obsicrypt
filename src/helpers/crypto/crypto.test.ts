import {
	checkVerifier,
	decryptString,
	encryptString,
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
