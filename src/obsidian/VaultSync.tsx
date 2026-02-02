import { useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { CachedMetadata, TFile } from 'obsidian';
import { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { getListItems, makeFile } from '../helpers/files/util';
import { makeTasks } from '../helpers/tasks/util';
import { filesAtom, pluginAtom } from '../store/atoms/files';
import { registerVaultEventHandlers, VaultEventListeners } from './events';

type VaultSyncProps = {
	children: ComponentChildren;
};

export function VaultSync({ children }: VaultSyncProps): JSX.Element {
	const hasRegisteredListeners = useRef(false);
	const plugin = useAtomValue(pluginAtom);
	const setFiles = useUpdateAtom(filesAtom);

	useEffect(() => {
		if (!plugin || hasRegisteredListeners.current) {
			return;
		}

		const replaceFileByPath = async (filePath: string, previousPath: string) => {
			const fileRef = plugin.app.vault.getAbstractFileByPath(filePath) as TFile;
			const fileContent = await plugin.app.vault.cachedRead(fileRef);
			const file = makeFile(fileRef, fileContent);
			const tasks = makeTasks(getListItems(plugin, fileRef), fileRef, fileContent);

			setFiles((current) => {
				current.files.delete(previousPath);
				current.tasks.delete(previousPath);
				current.files.set(filePath, file);
				current.tasks.set(filePath, tasks);
				return { ...current };
			});
		};

		const updateFile = async (
			file: TFile,
			data: string,
			cache: CachedMetadata
		) => {
			setFiles((current) => {
				const currentFile = current.files.get(file.path);

				if (!currentFile) {
					return { ...current };
				}

				current.files.set(file.path, {
					...currentFile,
					data: { content: data },
				});

				if (cache.listItems) {
					current.tasks.set(file.path, makeTasks(cache.listItems, file, data));
				}

				return { ...current };
			});
		};

		const addFile = async (path: string) => {
			const fileRef = plugin.app.vault.getAbstractFileByPath(path) as TFile;
			const fileContent = await plugin.app.vault.cachedRead(fileRef);
			const file = makeFile(fileRef, fileContent);
			const tasks = makeTasks(getListItems(plugin, fileRef), fileRef, fileContent);

			setFiles((current) => {
				current.files.set(file.path, file);
				current.tasks.set(file.path, tasks);
				return { ...current };
			});
		};

		const deleteFile = (path: string) => {
			setFiles((current) => {
				current.files.delete(path);
				current.tasks.delete(path);
				return { ...current };
			});
		};

		const listeners: VaultEventListeners = {
			changed: (file, data, cache) => void updateFile(file, data, cache),
			create: (file) => void addFile(file.path),
			delete: (file) => deleteFile(file.path),
			rename: (file, oldPath) => void replaceFileByPath(file.path, oldPath),
		};

		registerVaultEventHandlers(plugin, listeners);
		hasRegisteredListeners.current = true;
	}, [plugin, setFiles]);

	return <>{children}</>;
}
