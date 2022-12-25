export type Taskey = {
	text: string;
	done: boolean;
	filePath: string;
	data: {
		line: number;
	};
};

export type TaskeyMap = Map<string, Taskey[]>;
