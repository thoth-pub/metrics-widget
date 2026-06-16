import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import type { Doi } from '../interfaces';
import { useDOIs } from './useDOIs';
import { useMetaData } from './useMetaData';
import { useServices } from './useServices';

type UseMetricsByMonthProps = {
	doi: Doi;
	startDate: string;
	endDate: string;
};

export const useMetricsByMonth = (props: UseMetricsByMonthProps) => {
	const { doi, startDate, endDate } = props;

	const { metricsService } = useServices();
	const {
		data,
		isLoading: isLoadingMetaData,
		error: errorMetaData,
	} = useMetaData(doi);

	const { bookDoi, chaptersDois, isQueryEnabled } = useDOIs(doi);

	const {
		data: metricsData = { bookMetrics: [], chaptersMetrics: [] },
		isLoading: metricsLoading,
		error: metricsError,
	} = useQuery({
		queryKey: [
			QUERY_KEYS.LAST_YEAR_METRICS,
			...chaptersDois,
			startDate,
			endDate,
		],
		queryFn: () =>
			metricsService.getMetricsByMonth({
				workDoi: bookDoi,
				chaptersDoi: chaptersDois,
				startDate,
				endDate,
			}),
		enabled: isQueryEnabled,
	});

	const isLoading = isLoadingMetaData || metricsLoading;
	const error = errorMetaData || metricsError;

	return { metaData: data, metricsData, isLoading, error };
};
