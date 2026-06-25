import { App, Modal } from 'obsidian';
import { createElement, render } from 'preact';

import { TextPrompt } from '../components/secrets/TextPrompt';

export type TextPromptOptions = {
	title: string;
	description?: string;
	placeholder?: string;
	submitLabel?: string;
	initialValue?: string;
};

/**
 * Opens a modal with a single text field. Resolves with the entered (trimmed)
 * string on submit — which may be empty — or `null` if the user cancels.
 */
export function promptForText(
	app: App,
	options: TextPromptOptions
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

		render(
			createElement(TextPrompt, {
				title: options.title,
				description: options.description,
				placeholder: options.placeholder,
				submitLabel: options.submitLabel,
				initialValue: options.initialValue,
				onSubmit: (value: string) => settle(value),
				onCancel: () => settle(null),
			}),
			modal.contentEl
		);

		modal.onClose = (): void => {
			render(null, modal.contentEl);
			settle(null);
		};

		modal.open();
	});
}
