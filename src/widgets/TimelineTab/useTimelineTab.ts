import { type Doi, type FilterOption, useMetricsByYear } from '@/shared';
import { useState } from 'react';
import { useYearsPaginationAndFilter } from './useYearsPaginationAndFilter';
import { useYearsTimelineMetrics } from './useYearsTimelineMetrics';
import { useYearTimelineMetrics } from './useYearTimelineMetrics';

const TABS = {
	YEARS: 'years',
	YEAR: 'year',
} as const;

export const useTimelineTab = (doi: Doi) => {
	const {
		metaData,
		metricsData: metricsDataByYear,
		isLoading: isLoadingMetricsByYear,
		error: errorMetricsByYear,
	} = useMetricsByYear(doi);

	const {
		activeYears,
		yearsOptions,
		selectedYears,
		isNextPageAvailable,
		isPreviousPageAvailable,
		isPaginationAvailable,
		setSelectedYears,
		nextPage,
		previousPage,
	} = useYearsPaginationAndFilter(doi);

	const [selectedPlatforms, setSelectedPlatforms] = useState<FilterOption[]>(
		[],
	);

	const {
		processedYearsData,
		platformOptions,
		csvData: csvDataByYears,
	} = useYearsTimelineMetrics({
		selectedPlatforms,
		selectedYears: activeYears,
		metricsDataByYear,
	});

	const {
		processedMonthsData,
		isLoading: isLoadingLastYearMetrics,
		error: errorLastYearMetrics,
		csvData: csvDataByMonths,
	} = useYearTimelineMetrics({
		doi,
		selectedYears,
		selectedPlatforms,
	});

	const activeTab = selectedYears.length === 1 ? TABS.YEAR : TABS.YEARS;
	const isActiveYearTab = activeTab === TABS.YEAR;

	const isLoading = isActiveYearTab
		? isLoadingLastYearMetrics
		: isLoadingMetricsByYear;
	const error = isActiveYearTab ? errorLastYearMetrics : errorMetricsByYear;

	const csvData = isActiveYearTab ? csvDataByMonths : csvDataByYears;

	const processedData = isActiveYearTab
		? processedMonthsData
		: processedYearsData;

	const xKey = isActiveYearTab ? 'month' : 'year';

	return {
		metaData,
		processedData,
		xKey,
		isLoading: isLoading,
		error: error,
		platformOptions,
		selectedPlatforms,
		csvData,
		selectedYears,
		yearsOptions,
		isNextPageAvailable,
		isPreviousPageAvailable,
		isPaginationAvailable,
		selectPlatform: setSelectedPlatforms,
		setSelectedYears,
		nextPage,
		previousPage,
	};
};
