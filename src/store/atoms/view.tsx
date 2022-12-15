import { atom } from 'jotai';
import { Views } from '../../types/Views';

export const viewAtom = atom<Views | null>(null);
