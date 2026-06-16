import {
	config,
	type Doi,
	type FilterOption,
	useMetricsByYear,
} from '@/shared';
import { useEffect, useState } from 'react';

const paginationStep = config.charts.timelineChart.maxYearsPerPage;

export const useYearsPaginationAndFilter = (doi: Doi) => {
	const { metricsData: metricsDataByYear } = useMetricsByYear(doi);
	const [selectedYears, setSelectedYears] = useState<FilterOption[]>([]);
	const [activePage, setActivePage] = useState(1);

	const years = new Set<string>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: we want to run this effect only when metricsDataByYear changes
	useEffect(() => {
		if (years.size !== 1) return;

		const firstYear = years.values().next().value;

		if (!firstYear) return;

		setSelectedYears([
			{
				label: firstYear,
				value: firstYear,
			},
		]);
	}, [metricsDataByYear]);

	for (const metric of metricsDataByYear.bookMetrics) {
		years.add(metric.year);
	}

	for (const metric of metricsDataByYear.chaptersMetrics) {
		years.add(metric.year);
	}

	const sortedYears = Array.from(years).sort((a, b) => +a - +b);

	const yearsOptions = sortedYears.map((year) => ({
		label: year,
		value: year,
	}));

	const maxPages = Math.ceil(sortedYears.length / paginationStep);
	const startIndex = (activePage - 1) * paginationStep;
	const endIndex = startIndex + paginationStep;

	const appliedYears =
		selectedYears.length === 0 ? yearsOptions : selectedYears;
	const yearsToDisplay = appliedYears
		.sort((a, b) => +a.value - +b.value)
		.slice(startIndex, endIndex);

	const maxPagesWithFilter = Math.ceil(appliedYears.length / paginationStep);

	const currentYears =
		yearsToDisplay.length > 1
			? yearsToDisplay
			: appliedYears.slice(-paginationStep);

	const nextPage = () => {
		if (activePage >= maxPages) return;

		setActivePage(activePage + 1);
	};

	const previousPage = () => {
		if (activePage <= 1) return;

		setActivePage(activePage - 1);
	};

	const isNextPageAvailableWithoutFilter = activePage < maxPages;
	const isNextPageAvailableWithFilter = activePage < maxPagesWithFilter;

	const isNextPageAvailable =
		selectedYears.length > 0
			? isNextPageAvailableWithFilter
			: isNextPageAvailableWithoutFilter;

	const isPaginationAvailable = maxPages > 1;

	return {
		yearsOptions,
		selectedYears,
		activeYears: currentYears,
		isNextPageAvailable: isNextPageAvailable,
		isPreviousPageAvailable: activePage > 1,
		isPaginationAvailable,
		setSelectedYears,
		nextPage,
		previousPage,
	};
};
