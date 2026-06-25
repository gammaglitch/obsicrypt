// A custom view that takes over the leaf for a whole-note-encrypted file and
// shows the unlock UI. This is Route B: instead of overlaying CodeMirror (which
// pulls in @codemirror and risks dual-instance errors), we swap the entire leaf
// to this plain ItemView. No @codemirror import anywhere.
//
// State carries the file path and, on the lock path, the freshly built envelope
// (so we don't depend on disk-write timing). On unlock we write plaintext back
// (decrypt-to-disk) and hand the leaf back to the markdown editor.

import { ItemView, TFile, ViewStateResult, WorkspaceLeaf } from 'obsidian';
import { createElement, render } from 'preact';

import { LockedNoteOverlay } from '../components/secrets/LockedNoteOverlay';
import { readEncryptedNote } from '../helpers/wholeNote';
import { LOCKED_NOTE_VIEW_ICON, LOCKED_NOTE_VIEW_TYPE } from './constants';

type LockedNoteState = {
	file?: string;
	envelope?: string;
};

export class LockedNoteView extends ItemView {
	private filePath = '';
	private envelope: string | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return LOCKED_NOTE_VIEW_TYPE;
	}

	getIcon(): string {
		return LOCKED_NOTE_VIEW_ICON;
	}

	getDisplayText(): string {
		const name = this.filePath.split('/').pop();
		return name ? `🔒 ${name}` : 'Locked note';
	}

	async setState(state: LockedNoteState, result: ViewStateResult): Promise<void> {
		this.filePath = state?.file ?? '';
		this.envelope = state?.envelope ?? null;
		await super.setState(state, result);
		await this.renderOverlay();
	}

	// Persist only the file path; the envelope is read from disk on restore.
	getState(): LockedNoteState {
		return { file: this.filePath };
	}

	async onClose(): Promise<void> {
		render(null, this.contentEl);
	}

	private async renderOverlay(): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(this.filePath);

		let envelope = this.envelope;
		if (!envelope) {
			if (!(file instanceof TFile)) {
				this.renderMessage('Could not find this note.');
				return;
			}
			const { flagged, envelope: fromDisk } = readEncryptedNote(
				await this.app.vault.read(file)
			);
			if (!flagged || !fromDisk) {
				// Not actually encrypted — hand back to the markdown editor.
				await this.leaf.setViewState({
					type: 'markdown',
					state: { file: this.filePath },
				});
				return;
			}
			envelope = fromDisk;
		}

		const onDecrypted = (plaintext: string): void => {
			void this.handleDecrypted(plaintext);
		};

		render(
			createElement(LockedNoteOverlay, { envelope, onDecrypted }),
			this.contentEl
		);
	}

	private async handleDecrypted(plaintext: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(this.filePath);
		if (file instanceof TFile) {
			// Decrypt-to-disk, then hand the leaf back to the real editor.
			await this.app.vault.modify(file, plaintext);
		}
		await this.leaf.setViewState({
			type: 'markdown',
			state: { file: this.filePath, mode: 'source' },
			active: true,
		});
	}

	private renderMessage(text: string): void {
		render(
			createElement(
				'div',
				{ className: 'p-4 text-sm text-obsidian-text-muted' },
				text
			),
			this.contentEl
		);
	}
}
