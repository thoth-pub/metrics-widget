import { useMetricsByCountryOrRegion } from '@/shared/hooks/useMetricsByCountryOrRegion';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { countriesBook, countriesChapters } from '../fixtures/metrics';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

const setup = (dataType: 'country' | 'continent') => {
	routeFetch({
		works: { [BOOK_DOI_URL]: workWithChapters },
		bookDoi: BOOK_DOI,
		metrics: {
			'country_uri,measure_uri': {
				book: countriesBook,
				chapters: countriesChapters,
			},
		},
	});

	return renderHook(
		() => useMetricsByCountryOrRegion({ doi: BOOK_DOI_URL, dataType }),
		{ wrapper: createWrapper() },
	);
};

const loaded = async (result: { current: { totalCount: number } }) =>
	waitFor(() => expect(result.current.totalCount).toBeGreaterThan(0));

describe('useMetricsByCountryOrRegion - country', () => {
	it('totals metrics per country across book and chapters, sorted by total descending', async () => {
		const { result } = setup('country');

		await loaded(result);

		expect(result.current.isLoading).toBe(false);
		expect(result.current.metaData.book.title).toBe('A Test Book');
		expect(result.current.preProcessedData).toEqual([
			['United States of America', 30],
			['France', 20],
			['Germany', 17], // 10 + 5 (book) + 2 (chapters)
			['Brazil', 4],
		]);
		expect(result.current.rawData).toEqual({
			Germany: 17,
			France: 20,
			'United States of America': 30,
			Brazil: 4,
		});
	});

	it('computes totalCount as the sum over countries and ignores entries without a country name', async () => {
		const { result } = setup('country');

		await loaded(result);

		// 17 + 20 + 30 + 4; the nameless World Reader entry (7) is excluded.
		expect(result.current.totalCount).toBe(71);
	});

	it('lists platforms in order of appearance with labels shortened by updateSource', async () => {
		const { result } = setup('country');

		await loaded(result);

		expect(result.current.platformOptions).toEqual([
			{ label: 'Google Books', value: 'Google Books' },
			{ label: 'OBP', value: 'Open Book Publishers' },
			{ label: 'OAPEN', value: 'OAPEN' },
			{
				label: 'World Reader',
				value: 'World Reader',
				disabled: true,
				disabledReason: 'Platform does not track data per country',
			},
		]);
	});

	it('filters totals by the selected platform value (raw source name)', async () => {
		const { result } = setup('country');

		await loaded(result);

		act(() => {
			result.current.setSelectedPlatforms([
				{ label: 'Google Books', value: 'Google Books' },
			]);
		});

		await waitFor(() => expect(result.current.totalCount).toBe(42));

		// Germany 10 + 2, USA 30; France and Brazil have no Google Books data but
		// stay in the result with 0.
		expect(result.current.rawData).toEqual({
			Germany: 12,
			France: 0,
			'United States of America': 30,
			Brazil: 0,
		});
		expect(result.current.preProcessedData.map(([name]) => name)).toEqual([
			'United States of America',
			'Germany',
			'France',
			'Brazil',
		]);
		// Options do not change with the selection.
		expect(result.current.platformOptions).toHaveLength(4);
	});

	it('matches the filter on the raw source, so a shortened label value selects nothing', async () => {
		const { result } = setup('country');

		await loaded(result);

		act(() => {
			result.current.setSelectedPlatforms([{ label: 'OBP', value: 'OBP' }]);
		});

		await waitFor(() => expect(result.current.totalCount).toBe(0));
		expect(Object.values(result.current.rawData)).toEqual([0, 0, 0, 0]);
	});

	it('gives a total of 0 when only a platform without per-country data is selected', async () => {
		const { result } = setup('country');

		await loaded(result);

		act(() => {
			result.current.setSelectedPlatforms([
				{ label: 'World Reader', value: 'World Reader' },
			]);
		});

		await waitFor(() => expect(result.current.totalCount).toBe(0));
		expect(result.current.platformOptions.filter((o) => o.disabled)).toEqual([
			{
				label: 'World Reader',
				value: 'World Reader',
				disabled: true,
				disabledReason: 'Platform does not track data per country',
			},
		]);
	});
});

describe('useMetricsByCountryOrRegion - continent', () => {
	it('groups by continent code and sums across countries, sorted descending', async () => {
		const { result } = setup('continent');

		await loaded(result);

		expect(result.current.preProcessedData).toEqual([
			['EU', 37], // Germany 17 + France 20
			['NA', 30],
			['SA', 4],
		]);
		expect(result.current.rawData).toEqual({ EU: 37, NA: 30, SA: 4 });
		expect(result.current.totalCount).toBe(71);
	});

	it('applies the same platform filter and disabled platforms as the country view', async () => {
		const { result } = setup('continent');

		await loaded(result);

		act(() => {
			result.current.setSelectedPlatforms([{ label: 'OAPEN', value: 'OAPEN' }]);
		});

		await waitFor(() => expect(result.current.totalCount).toBe(24));

		expect(result.current.rawData).toEqual({ EU: 20, NA: 0, SA: 4 });
		expect(result.current.platformOptions.at(-1)).toMatchObject({
			value: 'World Reader',
			disabled: true,
		});
	});

	it('skips entries without a country name even when they have a continent code', async () => {
		routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			bookDoi: BOOK_DOI,
			metrics: {
				'country_uri,measure_uri': {
					book: [{ ...countriesBook[3], continent_code: 'AF' }],
					chapters: [countriesChapters[1]],
				},
			},
		});

		const { result } = renderHook(
			() =>
				useMetricsByCountryOrRegion({
					doi: BOOK_DOI_URL,
					dataType: 'continent',
				}),
			{ wrapper: createWrapper() },
		);

		await waitFor(() => expect(result.current.totalCount).toBeGreaterThan(0));

		expect(result.current.rawData).toEqual({ SA: 4 });
	});
});
