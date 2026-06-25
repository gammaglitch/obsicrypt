// Holds derived AES keys in memory for the session so an already-unlocked
// .ocnote reopens without re-running PBKDF2. Keys are never persisted and are
// dropped on plugin unload / vault lock.

export class SessionKeyCache {
	private keys = new Map<string, CryptoKey>();

	get(path: string): CryptoKey | undefined {
		return this.keys.get(path);
	}

	set(path: string, key: CryptoKey): void {
		this.keys.set(path, key);
	}

	has(path: string): boolean {
		return this.keys.has(path);
	}

	forget(path: string): void {
		this.keys.delete(path);
	}

	/** Keep a cached key attached to its file when it's renamed/moved. */
	rename(oldPath: string, newPath: string): void {
		const key = this.keys.get(oldPath);
		if (key) {
			this.keys.delete(oldPath);
			this.keys.set(newPath, key);
		}
	}

	clear(): void {
		this.keys.clear();
	}
}
