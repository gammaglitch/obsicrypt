import { TaskType } from './Task';

export type FileType = {
	name: string;
	tasks: TaskType[];
	path: string;
};
