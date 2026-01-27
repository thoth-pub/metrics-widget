import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import type { Doi } from '../interfaces';
import { useMetaData } from './useMetaData';
import { useSelectedChapters } from './useSelectedChapters';
import { useServices } from './useServices';

export const useMetricsByYear = (doi: Doi) => {
	const { metricsService } = useServices();
	const {
		data,
		normalizedDois,
		isLoading: isLoadingMetaData,
		error: errorMetaData,
	} = useMetaData(doi);
	const { selectedChapters } = useSelectedChapters();
	const selectedChaptersDois = selectedChapters.map((chapter) => chapter.value);

	const filteredChaptersDois =
		selectedChapters.length === 0
			? normalizedDois.chaptersDois
			: normalizedDois.chaptersDois.filter((doi) =>
					selectedChaptersDois.includes(doi),
				);

	const {
		data: metricsData = { bookMetrics: [], chaptersMetrics: [] },
		isLoading: metricsLoading,
		error: metricsError,
	} = useQuery({
		queryKey: [QUERY_KEYS.METRICS_BY_YEAR, ...filteredChaptersDois],
		queryFn: () =>
			metricsService.getMetricsByYear({
				workDoi: normalizedDois.bookDoi,
				chaptersDoi: filteredChaptersDois,
			}),
		enabled: normalizedDois.bookDoi.length > 0 && !isLoadingMetaData,
	});

	const isLoading = isLoadingMetaData || metricsLoading;
	const error = errorMetaData || metricsError;

	return { metaData: data, metricsData, isLoading, error };
};
