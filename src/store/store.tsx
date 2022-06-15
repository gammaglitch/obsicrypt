import create from 'zustand';

import { FileType } from '../types/File';

type StoreState = {
	files: FileType[];
	setFiles: (files: FileType[]) => void;
};

const useStore = create<StoreState>((set) => ({
	files: [],
	setFiles: (files) =>
		set((state) => ({
			...state,
			files,
		})),
}));

export default useStore;
