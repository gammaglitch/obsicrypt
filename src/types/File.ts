import { ListItemCache } from 'obsidian';

export type ParsedFile = {
	name: string;
	path: string;
	fileContent: string;
	fileLines: string[];
	listItems: ListItemCache[];
};
