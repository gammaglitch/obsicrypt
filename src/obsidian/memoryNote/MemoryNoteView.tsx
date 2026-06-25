// Memory-only encrypted note view. Obsidian hands us the ciphertext envelope as
// the file's text; we decrypt into a private field and edit there. `this.data`
// (what Obsidian persists) is ALWAYS the ciphertext envelope — plaintext lives
// only in `this.plaintext` and is never written to disk.

import { Component, MarkdownRenderer, TextFileView, WorkspaceLeaf } from 'obsidian';
import { createElement, render } from 'preact';

import { MemoryNoteApp } from '../../components/secrets/MemoryNoteApp';
import {
	decryptWithKey,
	deriveKey,
	encryptWithKey,
} from '../../helpers/crypto/crypto';
import { EnvelopeParts, format, parse } from '../../helpers/crypto/envelope';
import {
	MEMORY_NOTE_VIEW_ICON,
	MEMORY_NOTE_VIEW_TYPE,
} from './constants';
import { SessionKeyCache } from './SessionKeyCache';
import { getMasterPassword, subscribe } from '../secretsStore';

const SAVE_DEBOUNCE_MS = 400;

export class MemoryNoteView extends TextFileView {
	private cache: SessionKeyCache;

	private parts: EnvelopeParts | null = null;
	private key: CryptoKey | null = null;
	private plaintext = '';
	private saveTimer: number | null = null;
	private parseError = false;
	private unsubscribe: (() => void) | null = null;
	private previewComponent: Component | null = null;

	constructor(leaf: WorkspaceLeaf, cache: SessionKeyCache) {
		super(leaf);
		this.cache = cache;
	}

	getViewType(): string {
		return MEMORY_NOTE_VIEW_TYPE;
	}

	getIcon(): string {
		return MEMORY_NOTE_VIEW_ICON;
	}

	getDisplayText(): string {
		// The view icon ('lock') already shows a padlock; no emoji prefix here.
		return this.file ? this.file.basename : 'Encrypted note';
	}

	// What Obsidian persists — always the ciphertext envelope, never plaintext.
	getViewData(): string {
		return this.data;
	}

	setViewData(data: string, _clear: boolean): void {
		this.data = data;
		this.cancelPendingSave();
		this.key = null;
		this.plaintext = '';
		this.parseError = false;

		try {
			this.parts = parse(data);
		} catch {
			this.parts = null;
			this.parseError = true;
			this.renderMessage('This file is not a valid encrypted note.');
			return;
		}

		const path = this.file?.path;
		const cachedKey = path ? this.cache.get(path) : undefined;

		if (cachedKey && this.parts) {
			const parts = this.parts;
			void decryptWithKey(parts, cachedKey)
				.then((plaintext) => {
					this.key = cachedKey;
					this.plaintext = plaintext;
					this.renderApp(true, plaintext);
				})
				.catch(() => {
					if (path) this.cache.forget(path);
					this.renderApp(false, '');
				});
			return;
		}

		this.renderApp(false, '');
	}

	clear(): void {
		this.cancelPendingSave();
		this.parts = null;
		this.key = null;
		this.plaintext = '';
	}

	onOpen(): Promise<void> {
		// Relock open notes when the vault is locked elsewhere.
		this.unsubscribe = subscribe(() => this.onStoreChange());
		return super.onOpen();
	}

	async onClose(): Promise<void> {
		this.cancelPendingSave();
		this.unsubscribe?.();
		this.unsubscribe = null;
		this.teardownPreview();
		render(null, this.contentEl);
	}

	private teardownPreview(): void {
		if (this.previewComponent) {
			this.removeChild(this.previewComponent);
			this.previewComponent = null;
		}
	}

	// Render the in-memory plaintext as markdown into `el`. Never touches disk —
	// MarkdownRenderer takes the string directly. A child Component manages the
	// lifecycle of any embedded renderers (code blocks, transclusions, …).
	private renderPreview(el: HTMLElement, markdown: string): void {
		this.teardownPreview();
		el.empty();
		const component = new Component();
		this.addChild(component);
		this.previewComponent = component;
		void MarkdownRenderer.renderMarkdown(
			markdown,
			el,
			this.file?.path ?? '',
			component
		);
	}

	private onStoreChange(): void {
		if (this.key && getMasterPassword() === null) {
			void this.relock();
		}
	}

	private async relock(): Promise<void> {
		this.cancelPendingSave();
		// Persist any unsaved edits as ciphertext while we still hold the key.
		await this.flushSave();
		this.teardownPreview();
		if (this.file?.path) {
			this.cache.forget(this.file.path);
		}
		this.key = null;
		this.plaintext = '';
		this.renderApp(false, '');
	}

	private renderApp(startUnlocked: boolean, startText: string): void {
		render(
			createElement(MemoryNoteApp, {
				startUnlocked,
				startText,
				decrypt: (password: string) => this.handleDecrypt(password),
				onChange: (text: string) => this.handleChange(text),
				onLock: () => this.handleLock(),
				renderPreview: (el: HTMLElement, markdown: string) =>
					this.renderPreview(el, markdown),
			}),
			this.contentEl
		);
	}

	private renderMessage(text: string): void {
		render(
			createElement(
				'div',
				{ className: 'p-4 text-sm text-red-400' },
				`🔒 ${text}`
			),
			this.contentEl
		);
	}

	// Derive the key from the master password + this file's stable salt, decrypt,
	// and cache the key for cheap re-encryption on save.
	private async handleDecrypt(password: string): Promise<string> {
		if (!this.parts) {
			throw new Error('No encrypted note loaded');
		}
		const key = await deriveKey(password, this.parts.salt);
		const plaintext = await decryptWithKey(this.parts, key);
		this.key = key;
		this.plaintext = plaintext;
		if (this.file?.path) {
			this.cache.set(this.file.path, key);
		}
		return plaintext;
	}

	private handleChange(text: string): void {
		this.plaintext = text;
		this.scheduleSave();
	}

	private handleLock(): void {
		this.cancelPendingSave();
		this.teardownPreview();
		if (this.file?.path) {
			this.cache.forget(this.file.path);
		}
		this.key = null;
		this.plaintext = '';
	}

	private scheduleSave(): void {
		this.cancelPendingSave();
		this.saveTimer = window.setTimeout(() => {
			this.saveTimer = null;
			void this.flushSave();
		}, SAVE_DEBOUNCE_MS);
	}

	private cancelPendingSave(): void {
		if (this.saveTimer != null) {
			window.clearTimeout(this.saveTimer);
			this.saveTimer = null;
		}
	}

	// Re-encrypt with the cached key (fresh IV, same salt — no PBKDF2) and let
	// Obsidian persist the new ciphertext envelope.
	private async flushSave(): Promise<void> {
		if (!this.key || !this.parts) {
			return;
		}
		const next = await encryptWithKey(this.plaintext, this.key, this.parts.salt);
		this.parts = next;
		this.data = format(next);
		this.requestSave();
	}
}
