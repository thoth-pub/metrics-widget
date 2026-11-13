import {
	config,
	type FilterOption,
	type MetricWidgetBucket,
	type MetricWidgetView,
} from '@/shared';
import { useEffect, useState } from 'react';

const paginationStep = config.charts.timelineChart.maxYearsPerPage;

const byStartDate = (a: FilterOption, b: FilterOption) => {
	if (a.value === b.value) return 0;

	return a.value < b.value ? -1 : 1;
};

/**
 * Pagination (12 buckets per page) and the year filter over R-YEAR's `YEAR` buckets (value = bucket start, label
 * as on the axis). Exactly one selected bucket is the open year. When R-YEAR serves a pair and has exactly one
 * bucket, that bucket is opened.
 */
export const useYearsPaginationAndFilter = (view: MetricWidgetView | null) => {
	const buckets = view && !view.isEmpty ? view.buckets : [];
	const [selected, setSelectedYears] = useState<FilterOption[]>([]);
	const [activePage, setActivePage] = useState(1);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only a new R-YEAR response opens its only bucket
	useEffect(() => {
		if (buckets.length !== 1) return;

		setSelectedYears([
			{ label: buckets[0].label, value: buckets[0].startDate },
		]);
	}, [view]);

	const yearsOptions: FilterOption[] = buckets.map((bucket) => ({
		label: bucket.label,
		value: bucket.startDate,
	}));

	// A selection left over from another read keeps only the buckets this read has.
	const selectedYears = selected
		.filter(({ value }) => buckets.some(({ startDate }) => startDate === value))
		.sort(byStartDate);

	const maxPages = Math.ceil(yearsOptions.length / paginationStep);
	const startIndex = (activePage - 1) * paginationStep;
	const endIndex = startIndex + paginationStep;

	const appliedYears = selectedYears.length === 0 ? yearsOptions : selectedYears;
	const yearsToDisplay = appliedYears.slice(startIndex, endIndex);
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

	const isNextPageAvailable =
		selectedYears.length > 0
			? activePage < maxPagesWithFilter
			: activePage < maxPages;

	const openBucket: MetricWidgetBucket | null =
		selectedYears.length === 1
			? (buckets.find(({ startDate }) => startDate === selectedYears[0].value) ??
				null)
			: null;

	return {
		yearsOptions,
		selectedYears,
		/** The bucket starts shown on the current page of the year view. */
		pageStartDates: new Set(currentYears.map(({ value }) => value)),
		openBucket,
		isNextPageAvailable,
		isPreviousPageAvailable: activePage > 1,
		isPaginationAvailable: maxPages > 1,
		setSelectedYears,
		nextPage,
		previousPage,
	};
};
