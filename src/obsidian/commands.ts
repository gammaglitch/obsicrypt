import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';

import { decryptString, encryptString } from '../helpers/crypto/crypto';
import { format, parse } from '../helpers/crypto/envelope';
import {
	buildEncryptedNote,
	isWholeNoteEncrypted,
	readEncryptedNote,
} from '../helpers/wholeNote';
import { LOCKED_NOTE_VIEW_TYPE } from './constants';
import { ensureUnlocked } from './ensureUnlocked';
import { setMasterPassword } from './secretsStore';

export function registerSecretsCommands(plugin: Plugin): void {
	plugin.addCommand({
		id: 'obsicrypt-encrypt-selection',
		name: 'Obsicrypt: Encrypt selection',
		editorCallback: (editor: Editor) => {
			void (async () => {
				const selection = editor.getSelection();
				if (!selection) {
					new Notice('Select some text first.');
					return;
				}
				const pw = await ensureUnlocked(plugin);
				if (pw === null) return;
				const parts = await encryptString(selection, pw);
				const envelope = format(parts);
				const replacement = `\n\`\`\`${'secret'}\n${envelope}\n\`\`\`\n`;
				editor.replaceSelection(replacement);
			})();
		},
	});

	plugin.addCommand({
		id: 'obsicrypt-lock-note',
		name: 'Obsicrypt: Lock note',
		editorCallback: (editor: Editor, ctx) => {
			void (async () => {
				const content = editor.getValue();
				if (!content.trim()) {
					new Notice('Nothing to lock — this note is empty.');
					return;
				}
				if (isWholeNoteEncrypted(content)) {
					new Notice('This note is already locked.');
					return;
				}
				const pw = await ensureUnlocked(plugin);
				if (pw === null) return;
				const envelope = format(await encryptString(content, pw));
				const flagged = buildEncryptedNote(envelope);

				// 1) Put ciphertext in the buffer so any pending save writes
				//    ciphertext, never the plaintext we're replacing.
				editor.setValue(flagged);

				// 2) Swap the leaf to the locked view (pass the envelope so it
				//    doesn't depend on the disk write landing first).
				if (ctx instanceof MarkdownView && ctx.file) {
					const file = ctx.file;
					await ctx.leaf.setViewState({
						type: LOCKED_NOTE_VIEW_TYPE,
						state: { file: file.path, envelope },
						active: true,
					});
					// 3) Guarantee disk holds ciphertext after the markdown view
					//    has unloaded (so it can't overwrite with plaintext).
					await plugin.app.vault.modify(file, flagged);
				}
				new Notice('Note locked.');
			})();
		},
	});

	plugin.addCommand({
		id: 'obsicrypt-unlock-note',
		name: 'Obsicrypt: Unlock note',
		editorCallback: (editor: Editor) => {
			void (async () => {
				const { flagged, envelope } = readEncryptedNote(editor.getValue());
				if (!flagged || envelope === null) {
					new Notice('This note is not locked.');
					return;
				}
				const pw = await ensureUnlocked(plugin);
				if (pw === null) return;
				try {
					const plaintext = await decryptString(parse(envelope), pw);
					// Write plaintext back so the note edits normally in the
					// real editor. Re-lock with "Obsicrypt: Lock note" when done.
					editor.setValue(plaintext);
					new Notice('Note unlocked.');
				} catch {
					new Notice('Could not unlock — wrong password or tampered content.');
				}
			})();
		},
	});

	plugin.addCommand({
		id: 'obsicrypt-lock-vault',
		name: 'Obsicrypt: Lock vault',
		callback: () => {
			setMasterPassword(null);
			new Notice('Obsicrypt vault locked.');
		},
	});
}
