import { useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { CachedMetadata, TFile } from 'obsidian';
import { ComponentChildren, createContext } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { getFileByPath, makeFile } from '../helpers/files/util';
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
		const fileRef = obsidian!.app.vault.getAbstractFileByPath(filePath);
		if (fileRef) {
			const content = await obsidian!.app.vault.cachedRead(fileRef as TFile);
			const file = makeFile(fileRef as TFile, content);
			setFiles((curr) => ({ ...curr, files: curr.files.set(path, file) }));
		}
		// TODO: the issue appears to be that we are not explicitly
		// updating the tasks inside the filesAtom, they're not auto updating,
		// which seems like a bad decision
	};

	const replaceFileHandler = async (oldPath: string, newPath: string) =>
		replaceFileByPath(newPath, oldPath);

	const updateFileHandler = async (
		file: TFile,
		data: string,
		cache: CachedMetadata
	) => {
		console.group('updateFileHandler');

		console.log(file);
		console.log(data);
		console.log(cache);

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

			return curr;
		});

		console.groupEnd();
		// replaceFileByPath(path, path)
	};

	const addFileToStore = async (path: string) => {
		const file = await getFileByPath(obsidian!, path);
		setFiles((curr) => [...curr, file]);
	};

	const deleteFileHandler = (path: string) =>
		setFiles((curr) => curr.filter((f) => f.path !== path));

	const value = {};

	return (
		<ObsidianContext.Provider value={value}>
			{children}
		</ObsidianContext.Provider>
	);
}
