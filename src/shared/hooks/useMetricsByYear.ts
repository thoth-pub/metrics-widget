import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import type { Doi } from '../interfaces';
import { useMetaData } from './useMetaData';
import { useServices } from './useServices';

export const useMetricsByYear = (doi: Doi) => {
	const { metricsService } = useServices();
	const {
		normalizedDois,
		isLoading: isLoadingMetaData,
		error: errorMetaData,
	} = useMetaData(doi);
	const {
		data: metricsData,
		isLoading: metricsLoading,
		error: metricsError,
	} = useQuery({
		queryKey: [QUERY_KEYS.METRICS_BY_YEAR],
		queryFn: () => metricsService.getMetricsByYear(normalizedDois),
		enabled: normalizedDois.length > 0,
	});

	const isLoading = isLoadingMetaData || metricsLoading;
	const error = errorMetaData || metricsError;

	return { data: metricsData, isLoading, error };
};
