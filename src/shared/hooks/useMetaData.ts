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
		data = { book: { doi, title: '', type: '', ordinal: 0 }, chapters: [] },
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: [QUERY_KEYS.META_DATA, doiUrl],
		queryFn: () => metaService.getMetadata(doiUrl),
		enabled: isValid && doiUrl.length > 0,
	});

	const chaptersDois = data.chapters.map((chapter) => chapter.doi);
	const normalizedChaptersDois = chaptersDois.map(normalizeDoi);

	return {
		data,
		normalizedDois: {
			bookDoi: normalizeDoi(data.book.doi),
			chaptersDois: normalizedChaptersDois,
		},
		isLoading,
		error,
		refetch,
	};
};
