import { Editor, Notice, Plugin } from 'obsidian';

import { encryptString } from '../helpers/crypto/crypto';
import { format } from '../helpers/crypto/envelope';
import { promptForPassword } from './PasswordModal';
import {
	getMasterPassword,
	hasVerifier,
	isUnlocked,
	setMasterPassword,
} from './secretsStore';

async function ensureUnlocked(plugin: Plugin): Promise<string | null> {
	if (!hasVerifier()) {
		new Notice(
			'Set a master password in Obsikit settings before encrypting.'
		);
		return null;
	}
	if (isUnlocked()) return getMasterPassword();
	const pw = await promptForPassword(plugin.app, {
		title: 'Unlock Obsikit vault',
		submitLabel: 'Unlock',
		verify: true,
	});
	if (pw === null) return null;
	setMasterPassword(pw);
	return pw;
}

export function registerSecretsCommands(plugin: Plugin): void {
	plugin.addCommand({
		id: 'obsikit-encrypt-selection',
		name: 'Obsikit: Encrypt selection',
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
		id: 'obsikit-lock-vault',
		name: 'Obsikit: Lock vault',
		callback: () => {
			setMasterPassword(null);
			new Notice('Obsikit vault locked.');
		},
	});
}
