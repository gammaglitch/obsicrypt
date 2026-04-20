import { Plugin, TAbstractFile, TFile } from 'obsidian';
import { useEffect, useState } from 'preact/hooks';

import { scanFileForSecrets, SecretRef } from '../helpers/scanSecrets';

type Listener = () => void;

let pluginRef: Plugin | null = null;
let secrets: Map<string, SecretRef[]> = new Map();
const listeners = new Set<Listener>();

function notify(): void {
	listeners.forEach((l) => l());
}

function isMarkdown(file: TAbstractFile): file is TFile {
	return file instanceof TFile && file.extension === 'md';
}

async function scanAndStore(plugin: Plugin, file: TFile): Promise<void> {
	const content = await plugin.app.vault.cachedRead(file);
	const refs = scanFileForSecrets(content);
	const prev = secrets.get(file.path);
	const hasRefs = refs.length > 0;
	const hadRefs = prev !== undefined && prev.length > 0;

	if (!hasRefs && !hadRefs) return;

	const next = new Map(secrets);
	if (hasRefs) {
		next.set(file.path, refs);
	} else {
		next.delete(file.path);
	}
	secrets = next;
	notify();
}

function dropPath(path: string): void {
	if (!secrets.has(path)) return;
	const next = new Map(secrets);
	next.delete(path);
	secrets = next;
	notify();
}

async function scanAll(plugin: Plugin): Promise<void> {
	const next = new Map<string, SecretRef[]>();
	const files = plugin.app.vault.getMarkdownFiles();
	await Promise.all(
		files.map(async (file) => {
			const content = await plugin.app.vault.cachedRead(file);
			const refs = scanFileForSecrets(content);
			if (refs.length > 0) {
				next.set(file.path, refs);
			}
		})
	);
	secrets = next;
	notify();
}

export async function initVaultSecrets(plugin: Plugin): Promise<void> {
	pluginRef = plugin;
	await scanAll(plugin);

	plugin.registerEvent(
		plugin.app.vault.on('create', (file) => {
			if (isMarkdown(file)) void scanAndStore(plugin, file);
		})
	);
	plugin.registerEvent(
		plugin.app.vault.on('delete', (file) => {
			if (isMarkdown(file)) dropPath(file.path);
		})
	);
	plugin.registerEvent(
		plugin.app.vault.on('rename', (file, oldPath) => {
			dropPath(oldPath);
			if (isMarkdown(file)) void scanAndStore(plugin, file);
		})
	);
	plugin.registerEvent(
		plugin.app.metadataCache.on('changed', (file) => {
			if (isMarkdown(file)) void scanAndStore(plugin, file);
		})
	);
}

export function getVaultSecrets(): Map<string, SecretRef[]> {
	return secrets;
}

export async function refreshVaultSecrets(): Promise<void> {
	if (!pluginRef) return;
	await scanAll(pluginRef);
}

function subscribe(listener: Listener): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function useVaultSecrets(): Map<string, SecretRef[]> {
	const [snapshot, setSnapshot] = useState(secrets);
	useEffect(
		() => subscribe(() => setSnapshot(getVaultSecrets())),
		[]
	);
	return snapshot;
}
