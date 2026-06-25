import { Notice, Plugin } from 'obsidian';

import { promptForPassword } from './PasswordModal';
import {
	getMasterPassword,
	hasVerifier,
	isUnlocked,
	setMasterPassword,
} from './secretsStore';

/**
 * Ensures the vault is unlocked, prompting for the master password if needed,
 * and returns it (or null if the user cancels / no master password is set yet).
 * Shared by the commands and the ribbon toggle.
 */
export async function ensureUnlocked(plugin: Plugin): Promise<string | null> {
	if (!hasVerifier()) {
		new Notice('Set a master password in Obsicrypt settings first.');
		return null;
	}
	if (isUnlocked()) {
		return getMasterPassword();
	}
	const pw = await promptForPassword(plugin.app, {
		title: 'Unlock Obsicrypt vault',
		submitLabel: 'Unlock',
		verify: true,
	});
	if (pw === null) {
		return null;
	}
	setMasterPassword(pw);
	return pw;
}
