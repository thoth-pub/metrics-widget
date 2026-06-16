import { use } from 'react';
import { SelectedChaptersContext } from '../context/SelectedChaptersContext';

export const useSelectedChapters = () => {
	const context = use(SelectedChaptersContext);

	return context;
};
