import { useState } from 'react';
import {
	type SelectedChapter,
	SelectedChaptersContext,
} from '../context/SelectedChaptersContext';

type ChaptersProviderProps = {
	children: Readonly<React.ReactNode>;
};

export const ChaptersProvider = ({ children }: ChaptersProviderProps) => {
	const [selectedChapters, setSelectedChapters] = useState<SelectedChapter[]>(
		[],
	);

	return (
		<SelectedChaptersContext value={{ selectedChapters, setSelectedChapters }}>
			{children}
		</SelectedChaptersContext>
	);
};
