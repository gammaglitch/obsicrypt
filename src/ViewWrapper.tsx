import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';

import { ObsidianContextProvider } from './context';
import { MainView } from './components/views/MainView';

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
