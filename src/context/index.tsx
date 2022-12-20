import { Plugin, TAbstractFile, TFile } from 'obsidian';
import { ComponentChildren, createContext } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { getFileByPath, getFiles } from '../helpers/files';
import { Status } from '../types/Status';
import { ObsidianContextDefinition } from './types';
import { useAtom, useAtomValue } from 'jotai';
import { filesAtom, obsidianAtom } from '../store/atoms/files';
import { useUpdateAtom } from 'jotai/utils';
import { FileType } from '../types/File';

export type ObsidianContextProviderProps = {
	children: ComponentChildren;
};

export const ObsidianContext = createContext<ObsidianContextDefinition | null>(
	null
);

export function ObsidianContextProvider({
	children,
}: ObsidianContextProviderProps): JSX.Element {
	const init = useRef<boolean>(false);
	const obsidian = useAtomValue(obsidianAtom);

	const setFiles = useUpdateAtom(filesAtom);

	useEffect(() => {
		console.log('context:obsidian', obsidian);
	}, [obsidian]);

	useEffect(() => {
		console.log('Context:useEffect');
		if (!init.current && obsidian) {
			initStore();
			init.current = false;
		}
	}, [obsidian]);

	const initStore = async () => {
		bindToObsidianEvents();
	};

	const replaceFileByPath = async (filePath: string, path: string) => {
		const file = await getFileByPath(obsidian!, filePath);
		setFiles((curr) => curr.map((f) => (f.path === path ? file : f)));
	};

	const replaceFileHandler = async (oldPath: string, newPath: string) =>
		replaceFileByPath(newPath, oldPath);

	const updateFileHandler = async (path: string) =>
		replaceFileByPath(path, path);

	const addFileToStore = async (path: string) => {
		const file = await getFileByPath(obsidian!, path);
		setFiles((curr) => [...curr, file]);
	};

	const deleteFileHandler = (path: string) =>
		setFiles((curr) => curr.filter((f) => f.path !== path));

	const bindToObsidianEvents = () => {
		console.log('Context:bindToObsidianEvents');
		if (obsidian) {
			obsidian.app.metadataCache.on('changed', (file: TFile) => {
				console.debug('changed');
				if (file instanceof TFile) {
					updateFileHandler(file.path);
				}
			});
			obsidian.app.vault.on('create', (file: TAbstractFile) => {
				console.debug('create');
				if (file instanceof TFile) {
					addFileToStore(file.path);
				}
			});
			obsidian.app.vault.on('delete', (file: TAbstractFile) => {
				console.debug('delete');
				if (file instanceof TFile) {
					deleteFileHandler(file.path);
				}
			});
			obsidian.app.vault.on(
				'rename',
				(file: TAbstractFile, oldPath: string) => {
					console.debug('rename');
					if (file instanceof TFile) {
						replaceFileHandler(oldPath, file.path);
					}
				}
			);
		}
	};

	const value = {};

	return (
		<ObsidianContext.Provider value={value}>
			{children}
		</ObsidianContext.Provider>
	);
}
