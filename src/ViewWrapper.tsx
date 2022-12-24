import { useUpdateAtom } from 'jotai/utils';
import { Plugin } from 'obsidian';
import { FunctionalComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import { MainView } from './components/views/MainView';
import { ObsidianContextProvider } from './context';
import { obsidianAtom } from './store/atoms/files';

export type ViewWrapperProps = {
	obsidian: Plugin;
};

export const ViewWrapper: FunctionalComponent<ViewWrapperProps> = ({
	obsidian,
}) => {
	const setObsidian = useUpdateAtom(obsidianAtom);

	useEffect(() => {
		setObsidian(obsidian);
	}, []);

	return (
		<ObsidianContextProvider>
			<MainView obsidian={obsidian} />
		</ObsidianContextProvider>
	);
};
