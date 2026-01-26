'use client';

import { createContext } from 'react';

export type SelectedChapter = {
	label: string;
	value: string;
};

export type SelectedChaptersContextType = {
	selectedChapters: SelectedChapter[];
	setSelectedChapters: (chapters: SelectedChapter[]) => void;
};

export const SelectedChaptersContext =
	createContext<SelectedChaptersContextType>({
		selectedChapters: [],
		setSelectedChapters: () => {},
	});
