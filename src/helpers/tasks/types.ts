import { Metadata } from '../../types/Task';

export type StoredTask = {
	text: string;
	displayText: string;
	originalText: string;
	done: boolean;
	filePath: string;
	data: {
		line: number;
	};
} & Metadata;

export type StoredTaskMap = Map<string, StoredTask[]>;
