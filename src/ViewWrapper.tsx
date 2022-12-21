import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';

import { MainView } from './components/views/MainView';
import { ObsidianContextProvider } from './context';

export type ViewWrapperProps = {
	obsidian: Plugin;
};

export const ViewWrapper: FunctionalComponent<ViewWrapperProps> = ({
	obsidian,
}) => {
	return (
		<ObsidianContextProvider>
			<MainView obsidian={obsidian} />
		</ObsidianContextProvider>
	);
};
