import { useYearsTimelineMetrics } from '@/widgets/TimelineTab/useYearsTimelineMetrics';
import { useYearTimelineMetrics } from '@/widgets/TimelineTab/useYearTimelineMetrics';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
	measure,
	monthlyBook,
	monthlyChapters,
	yearlyBook,
	yearlyChapters,
} from '../fixtures/metrics';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { metricsRequests, routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

const theme = {
	'mw-chart-metric-google-books': 'rgb(1, 1, 1)',
	'mw-chart-metric-oapen': 'rgb(2, 2, 2)',
	'mw-chart-metric-open-book-publishers': 'rgb(3, 3, 3)',
	'mw-chart-metric-default': 'rgb(9, 9, 9)',
};

const years = (...values: string[]) =>
	values.map((value) => ({ label: value, value }));

const metricsDataByYear = {
	bookMetrics: yearlyBook,
	chaptersMetrics: yearlyChapters,
};

const renderYears = (
	selectedYears: ReturnType<typeof years>,
	selectedPlatforms: { label: string; value: string }[] = [],
) =>
	renderHook(
		() =>
			useYearsTimelineMetrics({
				selectedPlatforms,
				selectedYears,
				metricsDataByYear,
			}),
		{ wrapper: createWrapper(theme) },
	).result.current;

describe('useYearsTimelineMetrics', () => {
	it('shapes book and chapter values per platform and year, using platform labels as names', () => {
		const { processedYearsData } = renderYears(years('2023', '2024'));

		expect(processedYearsData).toEqual([
			{
				name: 'Google Books',
				color: 'rgb(1, 1, 1)',
				data: [
					{ year: '2023', book: 10, chapters: 3, source: 'Google Books' },
					{ year: '2024', book: 6, chapters: 0, source: 'Google Books' },
				],
			},
			{
				name: 'OBP',
				color: 'rgb(3, 3, 3)',
				data: [{ year: '2023', book: 4, chapters: 1, source: 'OBP' }],
			},
			{
				name: 'OBP HTML Reader',
				color: 'rgb(9, 9, 9)',
				data: [
					{ year: '2024', book: 5, chapters: 0, source: 'OBP HTML Reader' },
				],
			},
			{
				name: 'OAPEN',
				color: 'rgb(2, 2, 2)',
				data: [{ year: '2024', book: 0, chapters: 8, source: 'OAPEN' }],
			},
		]);
	});

	it('only includes the selected years', () => {
		const { processedYearsData, platformOptions } = renderYears(years('2024'));

		expect(processedYearsData.map(({ name }) => name)).toEqual([
			'Google Books',
			'OBP HTML Reader',
			'OAPEN',
		]);
		expect(processedYearsData[0].data).toEqual([
			{ year: '2024', book: 6, chapters: 0, source: 'Google Books' },
		]);
		// Platforms with data only in other years are not offered as options.
		expect(platformOptions.map(({ value }) => value)).not.toContain('OBP');
	});

	it('builds platform options (label = value = shortened name) for platforms in the selected years', () => {
		const { platformOptions } = renderYears(years('2023', '2024'));

		expect(platformOptions).toEqual([
			{ label: 'Google Books', value: 'Google Books' },
			{ label: 'OBP', value: 'OBP' },
			{ label: 'OBP HTML Reader', value: 'OBP HTML Reader' },
			{ label: 'OAPEN', value: 'OAPEN' },
		]);
	});

	it('keeps every platform in the result but empties the data of unselected platforms', () => {
		const { processedYearsData } = renderYears(years('2023', '2024'), [
			{ label: 'OBP', value: 'OBP' },
		]);

		expect(
			processedYearsData.map(({ name, data }) => [name, data.length]),
		).toEqual([
			['Google Books', 0],
			['OBP', 1],
			['OBP HTML Reader', 0],
			['OAPEN', 0],
		]);
	});

	it('matches the platform filter on the shortened name, not on the raw source', () => {
		const { processedYearsData } = renderYears(years('2023'), [
			{ label: 'Open Book Publishers', value: 'Open Book Publishers' },
		]);

		expect(processedYearsData.every(({ data }) => data.length === 0)).toBe(
			true,
		);
	});

	it('writes a CSV with one column per selected year, zero-filled, as strings', () => {
		const { csvData } = renderYears(years('2023', '2024'));

		expect(csvData).toEqual([
			['Platform', '2023', '2024'],
			['Google Books', '13', '6'],
			['OBP', '5', '0'],
			['OBP HTML Reader', '0', '5'],
			['OAPEN', '0', '8'],
		]);
	});

	it('leaves unselected platforms out of the CSV', () => {
		const { csvData } = renderYears(years('2023', '2024'), [
			{ label: 'OAPEN', value: 'OAPEN' },
		]);

		expect(csvData).toEqual([
			['Platform', '2023', '2024'],
			['OAPEN', '0', '8'],
		]);
	});

	it('returns empty data and a header-only CSV when no year is selected', () => {
		const { processedYearsData, platformOptions, csvData } = renderYears([]);

		expect(processedYearsData).toEqual([]);
		expect(platformOptions).toEqual([]);
		expect(csvData).toEqual([['Platform']]);
	});

	it('adds up several measures of the same platform and year', () => {
		const { result } = renderHook(
			() =>
				useYearsTimelineMetrics({
					selectedPlatforms: [],
					selectedYears: years('2024'),
					metricsDataByYear: {
						bookMetrics: [
							{
								year: '2024',
								data: [
									measure('Google Books', 'views', 1),
									measure('Google Books', 'downloads', 2),
								],
							},
						],
						chaptersMetrics: [],
					},
				}),
			{ wrapper: createWrapper(theme) },
		);

		expect(result.current.processedYearsData[0].data).toEqual([
			{ year: '2024', book: 3, chapters: 0, source: 'Google Books' },
		]);
	});
});

describe('useYearTimelineMetrics (single year, by month)', () => {
	const setup = (
		selectedPlatforms: { label: string; value: string }[] = [],
		selectedYears = years('2024'),
	) => {
		const fetchMock = routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			bookDoi: BOOK_DOI,
			metrics: {
				'measure_uri,month': { book: monthlyBook, chapters: monthlyChapters },
			},
		});
		const hook = renderHook(
			() =>
				useYearTimelineMetrics({
					doi: BOOK_DOI_URL,
					selectedYears,
					selectedPlatforms,
				}),
			{ wrapper: createWrapper(theme) },
		);

		return { fetchMock, ...hook };
	};

	it('requests the selected year as [Jan 1, Jan 1 of next year)', async () => {
		const { fetchMock, result } = setup();

		await waitFor(() =>
			expect(result.current.processedMonthsData.length).toBeGreaterThan(0),
		);

		const urls = metricsRequests(fetchMock);

		// Two requests before the metadata resolves (book + empty chunk), two after.
		expect(urls).toHaveLength(4);
		for (const url of urls) {
			expect(url).toContain(
				'aggregation=measure_uri,month&start_date=2024-01-01&end_date=2025-01-01&filter=',
			);
		}
	});

	it('shapes months per platform in order of first appearance, merging measure types and book/chapters', async () => {
		const { result } = setup();

		await waitFor(() =>
			expect(result.current.processedMonthsData.length).toBeGreaterThan(0),
		);

		expect(result.current.isLoading).toBe(false);
		expect(result.current.processedMonthsData).toEqual([
			{
				name: 'Google Books',
				color: 'rgb(1, 1, 1)',
				data: [
					// Months are not sorted: Jan, Mar from the book, then Dec from chapters.
					{ month: 'Jan', book: 4, chapters: 10, source: 'Google Books' },
					{ month: 'Mar', book: 2, chapters: 5, source: 'Google Books' },
					{ month: 'Dec', book: 0, chapters: 1, source: 'Google Books' },
				],
			},
			{
				name: 'OBP',
				color: 'rgb(3, 3, 3)',
				data: [{ month: 'Feb', book: 7, chapters: 0, source: 'OBP' }],
			},
		]);
	});

	it('writes a 12-month CSV with numeric (not string) values, zero-filled', async () => {
		const { result } = setup();

		await waitFor(() =>
			expect(result.current.csvData.length).toBeGreaterThan(1),
		);

		expect(result.current.csvData).toEqual([
			[
				'Platform',
				'Jan',
				'Feb',
				'Mar',
				'Apr',
				'May',
				'Jun',
				'Jul',
				'Aug',
				'Sep',
				'Oct',
				'Nov',
				'Dec',
			],
			['Google Books', 14, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			['OBP', 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		]);
	});

	it('filters by platform: others keep their entry with no data and drop out of the CSV', async () => {
		const { result } = setup([{ label: 'OBP', value: 'OBP' }]);

		await waitFor(() =>
			expect(result.current.processedMonthsData.length).toBeGreaterThan(0),
		);

		expect(
			result.current.processedMonthsData.map(({ name, data }) => [
				name,
				data.length,
			]),
		).toEqual([
			['Google Books', 0],
			['OBP', 1],
		]);
		expect(result.current.csvData.map(([platform]) => platform)).toEqual([
			'Platform',
			'OBP',
		]);
	});

	it('keeps months with an unrecognized key in the chart data but silently drops them from the CSV', async () => {
		routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			bookDoi: BOOK_DOI,
			metrics: {
				'measure_uri,month': {
					book: [
						{
							...measure('Google Books', 'views', 0),
							data: [
								{ month: '02', value: 3 },
								{ month: '2024-05', value: 9 },
							],
						},
					],
				},
			},
		});
		const { result } = renderHook(
			() =>
				useYearTimelineMetrics({
					doi: BOOK_DOI_URL,
					selectedYears: years('2024'),
					selectedPlatforms: [],
				}),
			{ wrapper: createWrapper(theme) },
		);

		await waitFor(() =>
			expect(result.current.processedMonthsData.length).toBeGreaterThan(0),
		);

		expect(result.current.processedMonthsData[0].data).toEqual([
			{ month: 'Feb', book: 3, chapters: 0, source: 'Google Books' },
			{ month: '2024-05', book: 9, chapters: 0, source: 'Google Books' },
		]);
		expect(result.current.csvData[1]).toEqual([
			'Google Books',
			0,
			3,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
		]);
	});

	it('uses only the first selected year for the request', async () => {
		const { fetchMock, result } = setup([], years('2022', '2024'));

		await waitFor(() =>
			expect(result.current.processedMonthsData.length).toBeGreaterThan(0),
		);

		expect(metricsRequests(fetchMock)[0]).toContain(
			'&start_date=2022-01-01&end_date=2023-01-01&',
		);
	});
});
