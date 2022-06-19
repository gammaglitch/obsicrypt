import create from 'zustand';

import { FileType } from '../types/File';
import { TaskType } from '../types/Task';

type StoreState = {
	files: FileType[];
	setFiles: (files: FileType[]) => void;
	tasks: TaskType[];
	setTasks: (tasks: TaskType[]) => void;
};

const useStore = create<StoreState>((set) => ({
	files: [],
	setFiles: (files) =>
		set((state) => ({
			...state,
			files,
		})),
	tasks: [],
	setTasks: (tasks) =>
		set((state) => ({
			...state,
			tasks,
		})),
}));

export default useStore;
