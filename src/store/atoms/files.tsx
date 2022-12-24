import { atom } from 'jotai';
import { atomWithDefault, loadable, selectAtom } from 'jotai/utils';
import { Plugin } from 'obsidian';

import { getFiles } from '../../helpers/files';
import { FileType } from '../../types/File';
import { tasksAtom } from './tasks';

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
	return [];
});

export const selectFiles = selectAtom(filesAtom, (files) => [
	...files.values(),
]);

export const selectNonEmptyFiles = atom((get) => {
	const files = get(filesAtom);
	const tasks = get(tasksAtom);
});

export const loadableFiles = loadable(selectFiles);

export const activeFileAtom = atom<FileType | null>(null);
