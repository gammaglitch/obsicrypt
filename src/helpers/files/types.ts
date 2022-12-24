export type Filey = {
	name: string;
	path: string;
	// tasks: { text: string }[];
	data: {
		content: string;
		// 	items: ListItemCache[];
	};
};

export type FileyMap = Map<string, Filey>;
