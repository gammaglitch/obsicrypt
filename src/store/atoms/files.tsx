import { atom } from 'jotai';
import { atomWithDefault, loadable, selectAtom } from 'jotai/utils';
import { Plugin } from 'obsidian';

import { StoredFile } from '../../helpers/files/types';
import { getFiles } from '../../helpers/files/util';

export const pluginAtom = atom<Plugin | null>(null);

export const selectPlugin = atom((get) => {
	const plugin = get(pluginAtom);

	if (plugin) {
		return plugin;
	}
	throw new Error('missing reference to plugin');
});

export const filesAtom = atomWithDefault((get) => {
	const plugin = get(pluginAtom);

	if (plugin) {
		return getFiles(plugin);
	}

	throw new Error('missing plugin');
});

export const selectFilesMap = selectAtom(filesAtom, (data) => data.files);

export const selectFiles = selectAtom(filesAtom, (data) => [
	...data.files.values(),
]);

export const loadableFiles = loadable(selectFiles);

export const allDataAtom = selectAtom(filesAtom, (data) => ({
	files: [...data.files.values()],
	tasks: [...data.tasks.values()],
}));

export const loadableAllDataAtom = loadable(allDataAtom);

export const activeFileAtom = atom<StoredFile | null>(null);

export const activeTagAtom = atom<string | null>(null);

export const activeDirectoryAtom = atom<string | null>(null);

export const allDirectoriesAtom = selectAtom(filesAtom, (data) => {
	const dirSet = new Set<string>();

	for (const path of data.files.keys()) {
		const dir = path.substring(0, path.lastIndexOf('/'));

		if (dir) {
			dirSet.add(dir);
		}
	}

	return Array.from(dirSet);
});

export const allTagsAtom = selectAtom(filesAtom, (data) => {
	const tagSet = new Set<string>();
	for (const tasks of data.tasks.values()) {
		tasks.forEach((task) => {
			task.tags.forEach((tag) => tagSet.add(tag));
		});
	}
	return Array.from(tagSet).sort();
});
