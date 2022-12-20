import { useContext } from 'preact/hooks';

import { ObsidianContext } from '../context';
import { ObsidianContextDefinition } from '../context/types';

export function useObsidianContext(): ObsidianContextDefinition | null {
	return useContext(ObsidianContext);
}
