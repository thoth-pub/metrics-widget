import {
	type Doi,
	type FilterOption,
	infoEntries,
	timelineCsv,
	timelineRows,
	timelineSeries,
	useMetricWidgetMonth,
	useMetricWidgetYear,
	viewCaptions,
} from '@/shared';
import { useState } from 'react';
import { useYearsPaginationAndFilter } from './useYearsPaginationAndFilter';

/**
 * The Timeline tab: the year view from R-YEAR's `YEAR` buckets, or, when exactly one year is open, the month view
 * of that year from its own month read (R-MONTH). R-MONTH is requested only while the Timeline tab is the active
 * tab (`isActive`) and one bucket is open.
 */
export const useTimelineTab = (doi: Doi, isActive: boolean) => {
	const year = useMetricWidgetYear(doi);
	const yearView = year.view && !year.view.isEmpty ? year.view : null;

	const pagination = useYearsPaginationAndFilter(year.view);
	const { openBucket } = pagination;

	const month = useMetricWidgetMonth(
		year,
		isActive && yearView !== null ? openBucket : null,
	);

	const [selectedSeries, setSelectedSeries] = useState<FilterOption[]>([]);
	const selectedPairKeys = new Set(selectedSeries.map(({ value }) => value));

	const seriesOptions: FilterOption[] = (yearView?.pairs ?? []).map((pair) => ({
		label: pair.label,
		value: pair.key,
	}));

	const isMonthView = openBucket !== null;
	const monthView = month.view && !month.view.isEmpty ? month.view : null;
	const shownView = isMonthView ? monthView : yearView;

	const series = shownView ? timelineSeries(shownView, selectedPairKeys) : [];
	const allRows = shownView ? timelineRows(shownView, series) : [];
	const rows =
		isMonthView || !shownView
			? allRows
			: allRows.filter(({ index }) =>
					pagination.pageStartDates.has(shownView.buckets[index].startDate),
				);

	return {
		year,
		month,
		isMonthView,
		/** The open bucket's year, for the month view's tooltip. */
		activeYear: openBucket ? openBucket.startDate.slice(0, 4) : '',
		series,
		rows,
		colorOf: year.colorOf,
		csvData: shownView ? timelineCsv(shownView, series) : undefined,
		captions: shownView
			? viewCaptions(shownView, openBucket ?? undefined)
			: [],
		info: infoEntries(shownView),
		seriesOptions,
		selectedSeries,
		selectSeries: setSelectedSeries,
		...pagination,
	};
};
