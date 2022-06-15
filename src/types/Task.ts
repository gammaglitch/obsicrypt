export type TaskType = {
	isComplete: boolean;
	text: string;
	originalText: string;
	line: {
		start: number;
		end: number;
	};
} & Metadata;

export type Metadata = {
	due: string | null;
};
