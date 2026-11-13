import type { SelectedChapter } from '../context/SelectedChaptersContext';
import type { Doi, WorkEntity } from '../interfaces';
import { isChapter, normalizeDoi } from '../utils';
import { useMetaData } from './useMetaData';
import { useSelectedChapters } from './useSelectedChapters';

/**
 * The reader's chapter selection as a `chapterDois` input: intersected with the current work's children that have
 * a DOI, canonical, lower-cased, de-duplicated and sorted. `undefined` (the field is omitted, so the read covers
 * every child) when nothing is selected or nothing of the selection is a current child.
 */
export const selectedChapterDois = (
	selectedChapters: SelectedChapter[],
	children: WorkEntity[],
): string[] | undefined => {
	const childDois = new Set(
		children
			.map((child) => normalizeDoi(child.doi).toLowerCase())
			.filter((doi) => doi.length > 0),
	);
	const dois = [
		...new Set(
			selectedChapters.map((chapter) =>
				normalizeDoi(chapter.value).toLowerCase(),
			),
		),
	]
		.filter((doi) => childDois.has(doi))
		.sort();

	return dois.length > 0 ? dois : undefined;
};

/**
 * The inputs of the widget's metrics reads for an embed DOI. Without a chapter selection the read does not wait
 * for the metadata read; with one it waits, so the selection can be intersected with the current children. An
 * invalid DOI enables no read. A chapter embed (work type `BOOK_CHAPTER`) never sends `chapterDois`.
 */
export const useDOIs = (doi: Doi) => {
	const { data, isSuccess } = useMetaData(doi);
	const { selectedChapters } = useSelectedChapters();

	const canonicalDoi = normalizeDoi(doi);
	const isChapterEmbed = isSuccess && isChapter(data.book.type);
	const hasSelection = selectedChapters.length > 0;
	const chapterDois =
		isSuccess && !isChapterEmbed && hasSelection
			? selectedChapterDois(selectedChapters, data.chapters)
			: undefined;

	return {
		doi: canonicalDoi,
		chapterDois,
		isChapterEmbed,
		isMetaDataSettled: isSuccess,
		isQueryEnabled: canonicalDoi.length > 0 && (!hasSelection || isSuccess),
	};
};
