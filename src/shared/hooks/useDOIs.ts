import type { Doi } from '../interfaces';
import { useMetaData } from './useMetaData';
import { useSelectedChapters } from './useSelectedChapters';

export const useDOIs = (doi: Doi) => {
	const { normalizedDois } = useMetaData(doi);
	const { selectedChapters } = useSelectedChapters();
	const selectedChaptersDois = selectedChapters.map((chapter) => chapter.value);

	const filteredChaptersDois =
		selectedChapters.length === 0
			? normalizedDois.chaptersDois
			: normalizedDois.chaptersDois.filter((doi) =>
					selectedChaptersDois.includes(doi),
				);

	return {
		bookDoi: normalizedDois.bookDoi,
		chaptersDois: filteredChaptersDois,
	};
};
