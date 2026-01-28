import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import type { Doi } from '../interfaces';
import { useDOIs } from './useDOIs';
import { useMetaData } from './useMetaData';
import { useServices } from './useServices';

export const useMetricsByCountries = (doi: Doi) => {
	const { metricsService } = useServices();
	const {
		data,
		isLoading: isLoadingMetaData,
		error: errorMetaData,
	} = useMetaData(doi);

	const { bookDoi, chaptersDois } = useDOIs(doi);

	const {
		data: metricsData = { bookMetrics: [], chaptersMetrics: [] },
		isLoading: metricsLoading,
		error: metricsError,
	} = useQuery({
		queryKey: [QUERY_KEYS.METRICS_BY_COUNTRY, ...chaptersDois],
		queryFn: () =>
			metricsService.getMetricsByCountry({
				workDoi: bookDoi,
				chaptersDoi: chaptersDois,
			}),
		enabled: bookDoi.length > 0,
	});

	const isLoading = isLoadingMetaData || metricsLoading;
	const error = errorMetaData || metricsError;

	return { metaData: data, metricsData, isLoading, error };
};
