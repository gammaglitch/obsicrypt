import create from 'zustand';
import { Plugin } from 'obsidian';

import { FileType } from '../types/File';
import { TaskType } from '../types/Task';

type StoreState = {
	obsidian: Plugin | null;
	setObsidian: (obsidian: Plugin) => void;
	files: FileType[];
	setFiles: (files: FileType[]) => void;
	replaceFile: (oldPath: string, file: FileType) => void;
	addFile: (file: FileType) => void;
	removeFile: (path: string) => void;
	tasks: TaskType[];
	setTasks: (tasks: TaskType[]) => void;
};

const useStore = create<StoreState>((set) => ({
	obsidian: null,
	setObsidian: (obsidian) => set((state) => ({ ...state, obsidian })),
	files: [],
	setFiles: (files) =>
		set((state) => ({
			...state,
			files,
		})),
	replaceFile: (oldPath, file) =>
		set((state) => ({
			...state,
			files: state.files.map((f) => (f.path === oldPath ? file : f)),
		})),
	addFile: (file) =>
		set((state) => ({
			...state,
			files: [...state.files, file],
		})),
	removeFile: (path) =>
		set((state) => ({
			...state,
			files: state.files.filter((f) => f.path !== path),
		})),
	tasks: [],
	setTasks: (tasks) =>
		set((state) => ({
			...state,
			tasks,
		})),
}));

export default useStore;
