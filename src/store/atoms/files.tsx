import { atom } from 'jotai';
import { atomWithDefault, loadable } from 'jotai/utils';
import { Plugin } from 'obsidian';
import { getFiles } from '../../helpers/files';
import { FileType } from '../../types/File';

export const obsidianAtom = atom<Plugin | null>(null);

export const selectObsidian = atom((get) => {
	const obsidian = get(obsidianAtom);

	if (obsidian) {
		return obsidian;
	} else {
		throw new Error('missing reference to obsidian');
	}
});

export const filesAtom = atomWithDefault(async (get) => {
	const obsidian = get(obsidianAtom);

	if (obsidian) {
		return getFiles(obsidian);
	} else {
		return [];
	}
});

export const loadableFiles = loadable(filesAtom);

export const activeFileAtom = atom<FileType | null>(null);
