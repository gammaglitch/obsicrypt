export type TaskType = {
	filePath: string;
	isComplete: boolean;
	text: string;
	displayText: string;
	originalText: string;
	line: {
		start: number;
		end: number;
	};
} & Metadata;

export type Metadata = {
	due: string | null;
	start: string | null;
	completedOn: string | null;
	tags: string[];
	contexts: string[];
	custom: Record<string, string[]>;
};
