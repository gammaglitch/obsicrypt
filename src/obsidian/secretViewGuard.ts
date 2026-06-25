// Watches for whole-note-encrypted files opening in a normal markdown editor and
// swaps that leaf to the LockedNoteView. Uses vault.cachedRead (disk-accurate,
// updated synchronously by vault.modify) rather than metadataCache (parsed
// async) so that decrypt-to-disk doesn't briefly re-trigger a lock.

import { MarkdownView, Plugin, TFile, WorkspaceLeaf } from 'obsidian';

import { isWholeNoteEncrypted } from '../helpers/wholeNote';
import { LOCKED_NOTE_VIEW_TYPE } from './constants';

async function swapIfEncrypted(plugin: Plugin, file: TFile | null): Promise<void> {
	if (!file || file.extension !== 'md') {
		return;
	}

	const content = await plugin.app.vault.cachedRead(file);
	if (!isWholeNoteEncrypted(content)) {
		return;
	}

	const targets: WorkspaceLeaf[] = [];
	plugin.app.workspace.iterateAllLeaves((leaf) => {
		const view = leaf.view;
		if (view instanceof MarkdownView && view.file?.path === file.path) {
			targets.push(leaf);
		}
	});

	for (const leaf of targets) {
		await leaf.setViewState({
			type: LOCKED_NOTE_VIEW_TYPE,
			state: { file: file.path },
			active: true,
		});
	}
}

export function registerSecretViewGuard(plugin: Plugin): void {
	plugin.registerEvent(
		plugin.app.workspace.on('file-open', (file) => {
			void swapIfEncrypted(plugin, file);
		})
	);

	// Catch notes already open in markdown editors when the plugin loads.
	plugin.app.workspace.onLayoutReady(() => {
		plugin.app.workspace
			.getLeavesOfType('markdown')
			.forEach((leaf) => {
				const view = leaf.view;
				if (view instanceof MarkdownView && view.file) {
					void swapIfEncrypted(plugin, view.file);
				}
			});
	});
}
