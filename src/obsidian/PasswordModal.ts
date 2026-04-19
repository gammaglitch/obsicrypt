import { App, Modal } from 'obsidian';
import { createElement, render } from 'preact';

import { PasswordPrompt } from '../components/secrets/PasswordPrompt';
import { checkVerifier } from '../helpers/crypto/crypto';
import { getSettings } from './secretsStore';

export type PasswordPromptOptions = {
	title: string;
	submitLabel?: string;
	/**
	 * When true, reject passwords that don't match the currently stored
	 * verifier. Used to prove the user knows the existing master password.
	 */
	verify?: boolean;
};

/**
 * Opens a modal asking the user for the master password. Resolves with the
 * entered password on submit, or `null` if the user cancels / closes it.
 */
export function promptForPassword(
	app: App,
	options: PasswordPromptOptions
): Promise<string | null> {
	return new Promise((resolve) => {
		const modal = new Modal(app);
		modal.titleEl.setText(options.title);

		let settled = false;
		const settle = (value: string | null): void => {
			if (settled) return;
			settled = true;
			resolve(value);
			modal.close();
		};

		let errorMessage: string | null = null;

		const mount = (): void => {
			render(null, modal.contentEl);
			render(
				createElement(PasswordPrompt, {
					title: options.title,
					submitLabel: options.submitLabel,
					error: errorMessage,
					onSubmit: async (pw: string) => {
						if (options.verify) {
							const verifier = getSettings().verifier;
							if (!verifier) {
								errorMessage =
									'No master password is set.';
								mount();
								return;
							}
							const ok = await checkVerifier(verifier, pw);
							if (!ok) {
								errorMessage = 'Incorrect master password.';
								mount();
								return;
							}
						}
						settle(pw);
					},
					onCancel: () => settle(null),
				}),
				modal.contentEl
			);
		};

		modal.onClose = (): void => {
			render(null, modal.contentEl);
			settle(null);
		};

		modal.open();
		mount();
	});
}
