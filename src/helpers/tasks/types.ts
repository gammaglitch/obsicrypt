import { Metadata } from '../../types/Task';

export type Taskey = {
	text: string;
	displayText: string;
	originalText: string;
	done: boolean;
	filePath: string;
	data: {
		line: number;
	};
} & Metadata;

export type TaskeyMap = Map<string, Taskey[]>;
