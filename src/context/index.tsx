import { ComponentChildren, createContext } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { ContextDefinition } from './types';

export type ContextProviderProps = {
	children: ComponentChildren;
};

export const Context = createContext<ContextDefinition | null>(null);

export function ContextProvider({
	children,
}: ContextProviderProps): JSX.Element {
	useEffect(() => {}, []);

	const value = useMemo(() => ({}), []);

	return <Context.Provider value={value}>{children}</Context.Provider>;
}
