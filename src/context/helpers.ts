import { CachedMetadata, Plugin, TAbstractFile, TFile } from 'obsidian';

export type Listeners = {
	changed: (file: TFile, data: string, cache: CachedMetadata) => any;
	create: (file: TAbstractFile) => any;
	delete: (file: TAbstractFile) => any;
	rename: (file: TAbstractFile, oldPath: string) => any;
};

type Events = keyof Listeners;

export function addObsidianListeners(obsidian: Plugin, listeners: Listeners) {
	obsidian.app.metadataCache.on('changed', (file: TFile, data, cache) => {
		console.debug('changed');
		if (file instanceof TFile) {
			listeners.changed(file, data, cache);
		}
	});
	obsidian.app.vault.on('create', (file: TAbstractFile) => {
		console.debug('create');
		if (file instanceof TFile) {
			listeners.create(file);
		}
	});
	obsidian.app.vault.on('delete', (file: TAbstractFile) => {
		console.debug('delete');
		if (file instanceof TFile) {
			listeners.delete(file);
		}
	});
	obsidian.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => {
		console.debug('rename');
		if (file instanceof TFile) {
			listeners.rename(file, oldPath);
		}
	});
}
