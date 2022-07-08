import { Plugin, TAbstractFile, TFile } from 'obsidian';
import { ComponentChildren, createContext } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { getFileByPath, getFiles } from '../helpers/files';
import useStore from '../store/store';
import { Status } from '../types/Status';
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
	const { obsidian, replaceFile, addFile, removeFile, setFiles, setStatus } =
		useStore();
	const init = useRef<boolean>(false);

	useEffect(() => {
		console.log('Context:useEffect');
		if (!init.current && obsidian) {
			initStore();
			init.current = false;
		}
	}, [obsidian]);

	const initStore = async () => {
		bindToObsidianEvents();
		await loadTasksIntoStore();
		setStatus(Status.READY);
	};

	const loadTasksIntoStore = async () => {
		const files = await getFiles(obsidian);
		setFiles(files);
	};

	const replaceFileHandler = async (oldPath: string, newPath: string) => {
		const file = await getFileByPath(obsidian, newPath);
		replaceFile(oldPath, file);
	};

	const updateFileHandler = async (path: string) => {
		const file = await getFileByPath(obsidian, path);
		replaceFile(path, file);
	};

	const addFileToStore = async (path: string) => {
		const file = await getFileByPath(obsidian, path);
		addFile(file);
	};

	const deleteFileHandler = (path: string) => {
		removeFile(path);
	};

	const bindToObsidianEvents = () => {
		console.log('Context:bindToObsidianEvents');
		obsidian.app.metadataCache.on('changed', (file: TFile) => {
			if (file instanceof TFile) {
				updateFileHandler(file.path);
			}
		});
		obsidian.app.vault.on('create', (file: TAbstractFile) => {
			if (file instanceof TFile) {
				addFileToStore(file.path);
			}
		});
		obsidian.app.vault.on('delete', (file: TAbstractFile) => {
			if (file instanceof TFile) {
				deleteFileHandler(file.path);
			}
		});
		obsidian.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => {
			if (file instanceof TFile) {
				replaceFileHandler(oldPath, file.path);
			}
		});
	};

	const value = {};

	return (
		<ObsidianContext.Provider value={value}>
			{children}
		</ObsidianContext.Provider>
	);
}
