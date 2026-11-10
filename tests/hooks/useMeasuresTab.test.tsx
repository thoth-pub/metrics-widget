import { useMeasuresTab } from '@/widgets/MeasuresTab/useMeasuresTab';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
	BOOK_DOI,
	BOOK_DOI_URL,
	CHAPTER_1_DOI,
	CHAPTER_2_DOI,
	CHAPTER_AS_WORK_DOI,
	CHAPTER_AS_WORK_DOI_URL,
	chapterAsMainWork,
	workWithChapters,
} from '../fixtures/works';
import { yearlyBook, yearlyChapters } from '../fixtures/metrics';
import { metricsRequests, routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

const theme = {
	'mw-chart-metric-google-books': 'rgb(1, 1, 1)',
	'mw-chart-metric-oapen': 'rgb(2, 2, 2)',
	'mw-chart-metric-default': 'rgb(9, 9, 9)',
};

describe('useMeasuresTab', () => {
	it('sums Book and Chapters per "<platform> <type>" key across years', async () => {
		const fetchMock = routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			bookDoi: BOOK_DOI,
			metrics: {
				'year,measure_uri': { book: yearlyBook, chapters: yearlyChapters },
			},
		});

		const { result } = renderHook(() => useMeasuresTab(BOOK_DOI_URL), {
			wrapper: createWrapper(theme),
		});

		await waitFor(() =>
			expect(Object.keys(result.current.measures)).not.toHaveLength(0),
		);

		expect(result.current.isLoading).toBe(false);
		expect(result.current.metaData.book.title).toBe('A Test Book');
		// Insertion order: book rows first (in order), then new chapter-only keys.
		expect(Object.keys(result.current.measures)).toEqual([
			'Google Books views',
			'OBP downloads',
			'OBP HTML Reader sessions',
			'OAPEN downloads',
		]);
		expect(result.current.measures).toEqual({
			'Google Books views': {
				source: 'Google Books',
				name: 'Google Books views',
				Book: 16, // 10 (2023) + 6 (2024)
				Chapters: 3,
				fill: 'rgb(1, 1, 1)',
				stroke: 'stripe-rgb(1, 1, 1)',
			},
			'OBP downloads': {
				source: 'Open Book Publishers',
				name: 'OBP downloads',
				Book: 4,
				Chapters: 1,
				fill: 'rgb(9, 9, 9)', // no platform color -> theme default
				stroke: 'stripe-rgb(9, 9, 9)',
			},
			'OBP HTML Reader sessions': {
				source: 'Open Book Publishers HTML Reader',
				name: 'OBP HTML Reader sessions',
				Book: 5,
				Chapters: 0,
				fill: 'rgb(9, 9, 9)',
				stroke: 'stripe-rgb(9, 9, 9)',
			},
			'OAPEN downloads': {
				source: 'OAPEN',
				name: 'OAPEN downloads',
				Book: 0,
				Chapters: 8,
				fill: 'rgb(2, 2, 2)',
				stroke: 'stripe-rgb(2, 2, 2)',
			},
		});
		expect(result.current.includedSources).toEqual([
			'Google Books views',
			'OBP downloads',
			'OBP HTML Reader sessions',
			'OAPEN downloads',
		]);
		// Strokes are de-duplicated by color.
		expect(result.current.strokes).toEqual({
			'stripe-rgb(1, 1, 1)': 'rgb(1, 1, 1)',
			'stripe-rgb(9, 9, 9)': 'rgb(9, 9, 9)',
			'stripe-rgb(2, 2, 2)': 'rgb(2, 2, 2)',
		});
		// Today's behaviour: until the metadata resolves, useMetaData falls back to
		// the DOI it was given, so metrics are first requested for the book with an
		// empty chapters chunk, then requested again once the chapters are known.
		const filters = metricsRequests(fetchMock).map(
			(url) => (url.split('&filter=')[1] ?? '').split(',measure_uri:')[0],
		);

		expect(filters).toEqual([
			`work_uri:info:doi:${BOOK_DOI}`,
			'work_uri:info:doi:',
			`work_uri:info:doi:${BOOK_DOI}`,
			`work_uri:info:doi:${CHAPTER_1_DOI},work_uri:info:doi:${CHAPTER_2_DOI}`,
		]);
	});

	it('builds CSV rows with raw source names (not labels) and Book/Chapter counts as strings', async () => {
		routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			bookDoi: BOOK_DOI,
			metrics: {
				'year,measure_uri': { book: yearlyBook, chapters: yearlyChapters },
			},
		});

		const { result } = renderHook(() => useMeasuresTab(BOOK_DOI_URL), {
			wrapper: createWrapper(theme),
		});

		await waitFor(() =>
			expect(result.current.csvData.length).toBeGreaterThan(1),
		);

		expect(result.current.csvData).toEqual([
			['Platform', 'Book', 'Chapter'],
			['Google Books', '16', '3'],
			['Open Book Publishers', '4', '1'],
			['Open Book Publishers HTML Reader', '5', '0'],
			['OAPEN', '0', '8'],
		]);
	});

	it('emits one CSV row per source+type, repeating the Platform name', async () => {
		routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			bookDoi: BOOK_DOI,
			metrics: {
				'year,measure_uri': {
					book: [
						{
							year: '2024',
							data: [
								{ ...yearlyBook[0].data[0], type: 'views', value: 1 },
								{ ...yearlyBook[0].data[0], type: 'downloads', value: 2 },
							],
						},
					],
				},
			},
		});

		const { result } = renderHook(() => useMeasuresTab(BOOK_DOI_URL), {
			wrapper: createWrapper(theme),
		});

		await waitFor(() =>
			expect(result.current.csvData.length).toBeGreaterThan(1),
		);

		expect(result.current.csvData.slice(1)).toEqual([
			['Google Books', '1', '0'],
			['Google Books', '2', '0'],
		]);
	});

	it('moves the Book count into the Chapter column when the main work is itself a chapter', async () => {
		routeFetch({
			works: { [CHAPTER_AS_WORK_DOI_URL]: chapterAsMainWork },
			bookDoi: CHAPTER_AS_WORK_DOI,
			metrics: {
				'year,measure_uri': { book: yearlyBook, chapters: yearlyChapters },
			},
		});

		const { result } = renderHook(
			() => useMeasuresTab(CHAPTER_AS_WORK_DOI_URL),
			{
				wrapper: createWrapper(theme),
			},
		);

		await waitFor(() =>
			expect(result.current.csvData.length).toBeGreaterThan(1),
		);

		// Measures keep the Book/Chapters split ...
		expect(result.current.measures['Google Books views'].Book).toBe(16);
		// ... but the CSV reports Book as '0' and Book + Chapters as Chapter.
		expect(result.current.csvData).toEqual([
			['Platform', 'Book', 'Chapter'],
			['Google Books', '0', '19'],
			['Open Book Publishers', '0', '5'],
			['Open Book Publishers HTML Reader', '0', '5'],
			['OAPEN', '0', '8'],
		]);
	});

	it('returns no measures and only the CSV header while there is no data', () => {
		routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			bookDoi: BOOK_DOI,
			metrics: {},
		});

		const { result } = renderHook(() => useMeasuresTab(BOOK_DOI_URL), {
			wrapper: createWrapper(theme),
		});

		expect(result.current.isLoading).toBe(true);
		expect(result.current.measures).toEqual({});
		expect(result.current.includedSources).toEqual([]);
		expect(result.current.csvData).toEqual([['Platform', 'Book', 'Chapter']]);
	});
});
