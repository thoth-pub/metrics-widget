import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import type { Doi } from '../interfaces';
import { buildDoiUrl, isValidDoi, normalizeDoi } from '../utils';
import { useServices } from './useServices';

export const useMetaData = (doi: Doi) => {
	const isValid = isValidDoi(doi);
	const doiUrl = buildDoiUrl(doi);

	const { metaService } = useServices();

	const {
		data: queryData,
		isLoading,
		isSuccess,
		error,
		refetch,
	} = useQuery({
		queryKey: [QUERY_KEYS.META_DATA, doiUrl],
		queryFn: () => metaService.getMetadata(doiUrl),
		enabled: isValid && doiUrl.length > 0,
	});

	const data = queryData ?? {
		book: { doi, title: '', type: '', ordinal: 0 },
		chapters: [],
	};
	const chaptersDois = data.chapters.map((chapter) => chapter.doi);
	const normalizedChaptersDois = chaptersDois.map(normalizeDoi);

	return {
		data,
		normalizedDois: {
			bookDoi: normalizeDoi(data.book.doi),
			chaptersDois: normalizedChaptersDois,
		},
		isLoading,
		isSuccess,
		/**
		 * True once this DOI's metadata read has succeeded, and it stays true when a later refetch fails: `data` then
		 * keeps the last successful result. The metrics reads latch on this, never on the live `isSuccess`.
		 */
		hasSucceeded: queryData !== undefined,
		error,
		refetch,
	};
};
