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

export const selectFiles = selectAtom(filesAtom, (data) => [
	...data.files.values(),
]);

export const loadableFiles = loadable(selectFiles);

export const loadableAllDataAtom = loadable(
	selectAtom(filesAtom, (data) => ({
		files: [...data.files.values()],
		tasks: [...data.tasks.values()],
	}))
);

export const activeFileAtom = atom<FileType | null>(null);
