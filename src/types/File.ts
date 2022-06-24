import { ListItemCache } from 'obsidian';

export type FileType = {
	name: string;
	path: string;
	fileContent?: string;
	fileLines?: string[];
	listItems?: ListItemCache[];
};
