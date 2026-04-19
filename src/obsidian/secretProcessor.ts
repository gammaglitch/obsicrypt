import { Plugin } from 'obsidian';
import { createElement, render } from 'preact';

import { SecretBlock } from '../components/secrets/SecretBlock';
import { promptForPassword } from './PasswordModal';
import {
	getSettings,
	hasVerifier,
	isUnlocked,
	setMasterPassword,
} from './secretsStore';

export const SECRET_BLOCK_LANG = 'secret';

export function registerSecretProcessor(plugin: Plugin): void {
	plugin.registerMarkdownCodeBlockProcessor(
		SECRET_BLOCK_LANG,
		(source, el) => {
			const mount = el.createDiv();

			const onRequestUnlock = async (): Promise<void> => {
				if (!hasVerifier()) {
					// No master password set yet — send the user to settings.
					// Obsidian's Notice API is the standard feedback channel.
					const { Notice } = await import('obsidian');
					new Notice(
						'Set a master password in Obsicrypt settings before unlocking secrets.'
					);
					return;
				}
				if (isUnlocked()) return;
				const pw = await promptForPassword(plugin.app, {
					title: 'Unlock Obsicrypt vault',
					submitLabel: 'Unlock',
					verify: true,
				});
				if (pw !== null) setMasterPassword(pw);
			};

			render(
				createElement(SecretBlock, { source, onRequestUnlock }),
				mount
			);

			// Best-effort cleanup when Obsidian tears down the block.
			void getSettings;
		}
	);
}
