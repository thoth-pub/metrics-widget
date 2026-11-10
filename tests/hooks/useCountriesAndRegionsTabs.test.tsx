import { useCountriesTab } from '@/widgets/CountriesTab/useCountriesTab';
import { useRegionsTab } from '@/widgets/RegionsTab/useRegionsTab';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { countriesBook, countriesChapters, measure } from '../fixtures/metrics';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

describe('useRegionsTab', () => {
	it('maps continent codes to names, percentages and palette colors, and writes the CSV', async () => {
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

		const { result } = renderHook(() => useRegionsTab(BOOK_DOI_URL), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.metricsData).not.toHaveLength(0));

		expect(result.current.metricsData).toEqual([
			{
				name: 'Europe',
				metrics: 37,
				percentage: (37 / 71) * 100,
				fill: 'var(--mw-color-countries-1)',
			},
			{
				name: 'Northern America',
				metrics: 30,
				percentage: (30 / 71) * 100,
				fill: 'var(--mw-color-countries-2)',
			},
			{
				name: 'Latin America and the Caribbean',
				metrics: 4,
				percentage: (4 / 71) * 100,
				fill: 'var(--mw-color-countries-3)',
			},
		]);
		expect(result.current.csvData).toEqual([
			['Region', 'Percentage'],
			['Europe', '52.11'],
			['Northern America', '42.25'],
			['Latin America and the Caribbean', '5.63'],
		]);
		// Nothing selected: every enabled platform counts as included.
		expect(result.current.includedSources).toEqual([
			'Google Books',
			'Open Book Publishers',
			'OAPEN',
		]);
	});
});

describe('useCountriesTab', () => {
	const manyCountries = Array.from({ length: 12 }, (_, i) => ({
		country_uri: `urn:c:${i}`,
		country_code: `C${i}`,
		country_name: i === 0 ? 'Russia' : `Country ${i}`,
		continent_code: 'EU',
		data: [measure('OAPEN', 'downloads', i < 10 ? 100 - i * 5 : 30 - i)],
	}));

	it('keeps the top 10 countries, aligns their names and groups the rest as "Others"', async () => {
		routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			bookDoi: BOOK_DOI,
			metrics: { 'country_uri,measure_uri': { book: manyCountries } },
		});

		const { result } = renderHook(() => useCountriesTab(BOOK_DOI_URL), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.metricsData).not.toHaveLength(0));

		const { metricsData, csvData } = result.current;

		// Top ten: 100, 95, ..., 55 (sum 775); the other two are 20 and 19.
		expect(metricsData).toHaveLength(11);
		expect(metricsData[0]).toEqual({
			name: 'Russian Federation',
			metrics: 100,
			percentage: (100 / 814) * 100,
			fill: 'var(--mw-color-countries-1)',
		});
		expect(metricsData[1].name).toBe('Country 1');
		expect(metricsData[9].fill).toBe('var(--mw-color-countries-10)');
		expect(metricsData[10]).toEqual({
			name: 'Others',
			metrics: 39,
			percentage: (39 / 814) * 100,
			fill: 'var(--mw-color-countries-11)',
		});
		expect(csvData[0]).toEqual(['Country', 'Percentage']);
		expect(csvData).toHaveLength(12);
	});
});
