import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountriesTab } from '@/widgets/CountriesTab/useCountriesTab';
import { useMapTab } from '@/widgets/MapTab/useMapTab';
import {
	country,
	graphqlData,
	NOW,
	OAPEN_DOWNLOADS,
	response,
	section,
	series,
	total,
	YEAR_RANGES,
	yearResponse,
} from '../fixtures/metricWidget';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(NOW);
});

const serve = (data: ReturnType<typeof response>) =>
	routeFetch({
		works: { [BOOK_DOI_URL]: workWithChapters },
		metricWidget: () => graphqlData(data),
	});

describe('Map tab hover text (useMapTab)', () => {
	it('is "<Country> · <share>%" for a country with a value and "<Country> · no data" without one', async () => {
		// Combined: GB 70 + 12 (chapters) = 82, US 50; the sum is 132.
		serve(yearResponse());

		const { result } = renderHook(() => useMapTab(BOOK_DOI), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.countries).toHaveLength(2));

		act(() =>
			result.current.updateContent(
				'United Kingdom of Great Britain and Northern Ireland',
			),
		);
		expect(result.current.tooltipContent).toBe(
			'United Kingdom of Great Britain and Northern Ireland · 62.12%',
		);

		act(() => result.current.updateContent('United States of America'));
		expect(result.current.tooltipContent).toBe(
			'United States of America · 37.88%',
		);

		act(() => result.current.updateContent('France'));
		expect(result.current.tooltipContent).toBe('France · no data');

		act(() => result.current.resetContent());
		expect(result.current.tooltipContent).toBe('');
	});
});

describe('Countries tab (useCountriesTab)', () => {
	it('keeps the top 10 countries of the combined distribution and sums the rest as "Others"', async () => {
		const codes = [
			'GB',
			'US',
			'DE',
			'FR',
			'ES',
			'IT',
			'JP',
			'BR',
			'CA',
			'IN',
			'MX',
			'SE',
		];
		// 120, 110, …, 10: a sum of 780; the two smallest (MX 20, SE 10) become "Others" (30).
		const values = codes.map((_, index) => String((codes.length - index) * 10));
		const sum = values.reduce((acc, value) => acc + Number(value), 0);

		serve(
			response({
				work: section({
					totals: [total(OAPEN_DOWNLOADS, String(sum))],
					timeline: series(
						OAPEN_DOWNLOADS,
						YEAR_RANGES,
						YEAR_RANGES.map(() => null),
					),
					countries: codes.map((code, index) =>
						country(OAPEN_DOWNLOADS, code, values[index]),
					),
				}),
			}),
		);

		const { result } = renderHook(() => useCountriesTab(BOOK_DOI), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.metricsData).toHaveLength(11));

		const rows = result.current.metricsData;

		expect(rows.slice(0, 10).map(({ value }) => value)).toEqual(
			values.slice(0, 10),
		);
		expect(rows[0]).toMatchObject({
			name: 'United Kingdom of Great Britain and Northern Ireland',
			value: '120',
		});
		expect(rows[10]).toMatchObject({
			name: 'Others',
			value: '30',
			metrics: 30,
			fill: 'var(--mw-color-countries-11)',
		});
		expect(rows[10].percentage).toBeCloseTo((30 / 780) * 100, 6);
		expect(rows.map(({ fill }) => fill).slice(0, 3)).toEqual([
			'var(--mw-color-countries-1)',
			'var(--mw-color-countries-2)',
			'var(--mw-color-countries-3)',
		]);
		// The CSV keeps every country, not only the top 10.
		expect(result.current.csvData?.length).toBe(1 + codes.length);
	});

	it('has no "Others" row with 10 countries or fewer', async () => {
		serve(yearResponse());

		const { result } = renderHook(() => useCountriesTab(BOOK_DOI), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.metricsData).toHaveLength(2));
		expect(result.current.metricsData.map(({ name }) => name)).toEqual([
			'United Kingdom of Great Britain and Northern Ireland',
			'United States of America',
		]);
	});
});
