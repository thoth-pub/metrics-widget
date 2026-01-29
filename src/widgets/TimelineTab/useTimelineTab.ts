import {
	type Doi,
	formatDateToApiFormat,
	getDateYearAgo,
	useMetricsByYear,
} from '@/shared';
import { useMetricsByMonth } from '@/shared/hooks/useMetricsByMonth';
import { useState } from 'react';

const TABS = {
	YEARS: 'years',
	YEAR: 'year',
} as const;

export const useTimelineTab = (doi: Doi) => {
	const startDate = getDateYearAgo();
	const formattedStartDate = formatDateToApiFormat(startDate);
	const { isLoading: isLoadingMetrics, error: errorMetrics } =
		useMetricsByYear(doi);
	const {
		metaData,
		metricsData,
		isLoading: isLoadingLastYearMetrics,
		error: errorLastYearMetrics,
	} = useMetricsByMonth({ doi, startDate: formattedStartDate });
	const [activeTab, _setActiveTab] = useState(TABS.YEARS);

	const isLoading = isLoadingMetrics || isLoadingLastYearMetrics;
	const error = errorMetrics || errorLastYearMetrics;

	console.log(metricsData);

	return {
		activeTab,
		metaData,
		processedData: [],
		isLoading: isLoading,
		error: error,
	};
};
