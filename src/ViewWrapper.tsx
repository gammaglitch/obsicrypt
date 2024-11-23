import { useAtom } from 'jotai';
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
	const [currObsidian, setObsidian] = useAtom(obsidianAtom);

	useEffect(() => {
		if (!currObsidian) {
			setObsidian(obsidian);
		}
	}, []);

	return (
		<ObsidianContextProvider>
			{currObsidian ? <MainView obsidian={obsidian} /> : <div>loading...</div>}
		</ObsidianContextProvider>
	);
};
