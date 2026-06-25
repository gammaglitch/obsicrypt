import { App, Notice, Plugin, TFile } from 'obsidian';

import { createEncrypted } from '../../helpers/crypto/crypto';
import { format } from '../../helpers/crypto/envelope';
import { ensureUnlocked } from '../ensureUnlocked';
import { MEMORY_NOTE_EXTENSION, MEMORY_NOTE_VIEW_TYPE } from './constants';
import { MemoryNoteView } from './MemoryNoteView';
import { SessionKeyCache } from './SessionKeyCache';

function uniquePath(app: App, folderPath: string, baseName: string): string {
	const dir = folderPath ? `${folderPath}/` : '';
	let candidate = `${dir}${baseName}.${MEMORY_NOTE_EXTENSION}`;
	let i = 1;
	while (app.vault.getAbstractFileByPath(candidate)) {
		candidate = `${dir}${baseName} ${i}.${MEMORY_NOTE_EXTENSION}`;
		i++;
	}
	return candidate;
}

async function openEncrypted(
	plugin: Plugin,
	path: string,
	plaintext: string,
	password: string,
	cache: SessionKeyCache
): Promise<void> {
	const { parts, key } = await createEncrypted(plaintext, password);
	const file = await plugin.app.vault.create(path, format(parts));
	// Seed the session key so the new note opens already unlocked.
	cache.set(file.path, key);
	await plugin.app.workspace.getLeaf(true).openFile(file);
}

async function createMemoryNote(plugin: Plugin, cache: SessionKeyCache): Promise<void> {
	const pw = await ensureUnlocked(plugin);
	if (pw === null) {
		return;
	}
	const path = uniquePath(plugin.app, '', 'Untitled');
	await openEncrypted(plugin, path, '', pw, cache);
}

async function convertActiveNote(plugin: Plugin, cache: SessionKeyCache): Promise<void> {
	const active = plugin.app.workspace.getActiveFile();
	if (!active || active.extension !== 'md') {
		new Notice('Open a markdown note to convert.');
		return;
	}
	const pw = await ensureUnlocked(plugin);
	if (pw === null) {
		return;
	}
	const content = await plugin.app.vault.read(active);
	const folder = active.parent && active.parent.path !== '/' ? active.parent.path : '';
	const path = uniquePath(plugin.app, folder, active.basename);
	await openEncrypted(plugin, path, content, pw, cache);
	new Notice(
		`Encrypted copy created: ${path.split('/').pop()}. The original "${active.name}" is still on disk in plaintext — delete it once you've verified the encrypted note.`
	);
}

export function registerMemoryNotes(plugin: Plugin, cache: SessionKeyCache): void {
	plugin.registerView(
		MEMORY_NOTE_VIEW_TYPE,
		(leaf) => new MemoryNoteView(leaf, cache)
	);

	try {
		plugin.registerExtensions([MEMORY_NOTE_EXTENSION], MEMORY_NOTE_VIEW_TYPE);
	} catch (error) {
		console.error('[memory-note] registerExtensions failed', error);
	}

	plugin.registerEvent(
		plugin.app.vault.on('rename', (file, oldPath) => {
			if (file instanceof TFile && file.extension === MEMORY_NOTE_EXTENSION) {
				cache.rename(oldPath, file.path);
			}
		})
	);

	plugin.addCommand({
		id: 'create-memory-note',
		name: 'Obsicrypt: Create memory-only encrypted note',
		callback: () => void createMemoryNote(plugin, cache),
	});

	plugin.addCommand({
		id: 'convert-note-to-memory-note',
		name: 'Obsicrypt: Convert current note to memory-only encrypted note',
		callback: () => void convertActiveNote(plugin, cache),
	});
}
