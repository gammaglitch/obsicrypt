import { useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { CachedMetadata, TFile } from 'obsidian';
import { ComponentChildren, createContext } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { getListItems, makeFile } from '../helpers/files/util';
import { makeTasks } from '../helpers/tasks/util';
import { filesAtom, obsidianAtom } from '../store/atoms/files';
import { addObsidianListeners, Listeners } from './helpers';
import { ObsidianContextDefinition } from './types';

export type ObsidianContextProviderProps = {
	children: ComponentChildren;
};

export const ObsidianContext = createContext<ObsidianContextDefinition | null>(
	null
);

export function ObsidianContextProvider({
	children,
}: ObsidianContextProviderProps): JSX.Element {
	const listeners: Listeners = {
		changed: (file, data, cache) => updateFileHandler(file, data, cache),
		create: (file) => addFileToStore(file.path),
		delete: (file) => deleteFileHandler(file.path),
		rename: (file, oldPath) => replaceFileHandler(oldPath, file.path),
	};

	const init = useRef<boolean>(false);
	const obsidian = useAtomValue(obsidianAtom);

	const setFiles = useUpdateAtom(filesAtom);

	useEffect(() => {
		console.debug('Context:useEffect');
		if (!init.current && obsidian) {
			bootstrap();
			init.current = false;
		}
	}, [obsidian]);

	const bootstrap = async () => {
		if (obsidian) {
			addObsidianListeners(obsidian, listeners);
		}
	};

	const replaceFileByPath = async (filePath: string, path: string) => {
		console.log('replaceFileByPath start');
		const fileRef = obsidian!.app.vault.getAbstractFileByPath(
			filePath
		) as TFile;
		const fileContent = await obsidian!.app.vault.cachedRead(fileRef);

		const file = makeFile(fileRef, fileContent);
		const tasks = makeTasks(
			getListItems(obsidian!, fileRef),
			fileRef,
			fileContent
		);

		setFiles((curr) => {
			curr.files.delete(path);
			curr.tasks.delete(path);

			curr.files.set(filePath, file);
			curr.tasks.set(filePath, tasks);

			return { ...curr };
		});
	};

	const replaceFileHandler = async (oldPath: string, newPath: string) =>
		replaceFileByPath(newPath, oldPath);

	const updateFileHandler = async (
		file: TFile,
		data: string,
		cache: CachedMetadata
	) => {
		setFiles((curr) => {
			const currFile = curr.files.get(file.path);

			if (currFile) {
				const newFile = { ...currFile, data: { content: data } };
				curr.files.set(file.path, newFile);

				if (cache.listItems) {
					const newTasks = makeTasks(cache.listItems, file, data);
					curr.tasks.set(file.path, newTasks);
				}
			}

			return { ...curr };
		});
	};

	const addFileToStore = async (path: string) => {
		if (obsidian) {
			const fileRef = obsidian.app.vault.getAbstractFileByPath(path) as TFile;
			const fileContent = await obsidian.app.vault.cachedRead(fileRef);

			const file = makeFile(fileRef, fileContent);
			const tasks = makeTasks(
				getListItems(obsidian!, fileRef),
				fileRef,
				fileContent
			);

			setFiles((curr) => {
				curr.files.set(file.path, file);
				curr.tasks.set(file.path, tasks);

				return { ...curr };
			});
		}
	};

	const deleteFileHandler = (path: string) => {
		if (obsidian) {
			setFiles((curr) => {
				curr.files.delete(path);
				curr.tasks.delete(path);

				return { ...curr };
			});
		}
	};

	const value = {};

	return (
		<ObsidianContext.Provider value={value}>
			{children}
		</ObsidianContext.Provider>
	);
}
