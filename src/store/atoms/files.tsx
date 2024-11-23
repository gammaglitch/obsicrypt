import { atom } from 'jotai';
import { atomWithDefault, loadable, selectAtom } from 'jotai/utils';
import { Plugin } from 'obsidian';

import { getFiles } from '../../helpers/files/util';
import { FileType } from '../../types/File';

export const obsidianAtom = atom<Plugin | null>(null);

export const selectObsidian = atom((get) => {
	const obsidian = get(obsidianAtom);

	if (obsidian) {
		return obsidian;
	}
	throw new Error('missing reference to obsidian');
});

export const filesAtom = atomWithDefault((get) => {
	const obsidian = get(obsidianAtom);

	if (obsidian) {
		return getFiles(obsidian);
	}

	throw new Error('missing obsidian');
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

export const activeFileAtom = atom<FileType | null>(null);

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
