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
	selectedFile: FileType | null;
	selectFile: (file: FileType) => void;
	selectedFilesTasks: () => TaskType[];
};

const useStore = create<StoreState>((set, get) => ({
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
	selectedFile: null,
	selectFile: (file) => set((state) => ({ ...state, selectedFile: file })),
	selectedFilesTasks: () =>
		get().tasks.filter((t) => t.filePath === get().selectedFile?.path),
}));

export default useStore;
