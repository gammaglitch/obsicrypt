import { Plugin } from 'obsidian';
import { useEffect, useState } from 'preact/hooks';

import { Verifier } from '../helpers/crypto/crypto';

export type SecretsSettings = {
	version: 1;
	verifier: Verifier | null;
};

const DEFAULT_SETTINGS: SecretsSettings = {
	version: 1,
	verifier: null,
};

type Listener = () => void;

let pluginRef: Plugin | null = null;
let settings: SecretsSettings = DEFAULT_SETTINGS;
let masterPassword: string | null = null;
const listeners = new Set<Listener>();

function notify(): void {
	listeners.forEach((l) => l());
}

export async function initSecretsStore(plugin: Plugin): Promise<void> {
	pluginRef = plugin;
	const raw = ((await plugin.loadData()) ?? {}) as Partial<SecretsSettings>;
	settings =
		raw.version === 1
			? { version: 1, verifier: raw.verifier ?? null }
			: DEFAULT_SETTINGS;
	notify();
}

export function getSettings(): SecretsSettings {
	return settings;
}

export async function updateSettings(next: SecretsSettings): Promise<void> {
	settings = next;
	if (pluginRef) {
		await pluginRef.saveData(next);
	}
	notify();
}

export function getMasterPassword(): string | null {
	return masterPassword;
}

export function setMasterPassword(pw: string | null): void {
	masterPassword = pw;
	notify();
}

export function isUnlocked(): boolean {
	return masterPassword !== null;
}

export function hasVerifier(): boolean {
	return settings.verifier !== null;
}

function subscribe(listener: Listener): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function useSecretsStore(): {
	settings: SecretsSettings;
	masterPassword: string | null;
	isUnlocked: boolean;
	hasVerifier: boolean;
} {
	const [, setTick] = useState(0);
	useEffect(
		() => subscribe(() => setTick((t) => t + 1)),
		[]
	);
	return {
		settings,
		masterPassword,
		isUnlocked: masterPassword !== null,
		hasVerifier: settings.verifier !== null,
	};
}
