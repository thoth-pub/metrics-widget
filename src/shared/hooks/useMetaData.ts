import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import type { Doi } from '../interfaces';
import { isValidDoi } from '../utils';
import { useServices } from './useServices';

export const useMetaData = (doi: Doi) => {
	const isValid = isValidDoi(doi);

	const { metaService } = useServices();

	const {
		data = { books: [], chapters: [] },
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.META_DATA, doi],
		queryFn: () => metaService.getMetadata(doi),
		enabled: isValid,
	});

	const booksDois = data.books.map((book) => book.doi);
	const chaptersDois = data.chapters.map((chapter) => chapter.doi);
	const dois = [...booksDois, ...chaptersDois];

	return { data, dois, isLoading, error };
};
