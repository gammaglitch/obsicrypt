export type SidebarSection = 'custom' | 'tags' | 'directories' | 'files';

export const config = {
	inboxPattern: 'example/*.md',
	sidebar: {
		sections: ['custom', 'tags', 'directories', 'files'] as SidebarSection[],
	},
};
