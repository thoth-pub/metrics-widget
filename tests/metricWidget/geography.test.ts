import { describe, expect, it } from 'vitest';
import geoData from '@/features/WorldMap/geoData.json';
import type { MetricWidgetData } from '@/shared/interfaces';
import {
	buildMetricWidgetView,
	combinedCountries,
	continentOf,
	continentValues,
	countriesCsv,
	countryCodeOf,
	countryName,
	noCountryBreakdownNote,
	regionsCsv,
	sharesProblem,
	UNKNOWN_REGION,
} from '@/shared/metricWidget';
import {
	country,
	OAPEN_DOWNLOADS,
	OBP_VIEWS,
	response,
	section,
	total,
	yearResponse,
	ZENODO_VIEWS,
} from '../fixtures/metricWidget';

const view = (data: MetricWidgetData, isChapterEmbed = false) => {
	const result = buildMetricWidgetView(data, { grain: 'YEAR', isChapterEmbed });

	if (!result) throw new Error('invalid view');

	return result;
};

describe('combined distribution', () => {
	it('sums each country exactly across pairs and sections', () => {
		const data = response({
			work: section({
				totals: [total(OAPEN_DOWNLOADS, '1'), total(OBP_VIEWS, '1')],
				countries: [
					country(OAPEN_DOWNLOADS, 'GB', '9007199254740993'),
					country(OBP_VIEWS, 'GB', '1'),
					country(OBP_VIEWS, 'DE', '5'),
				],
			}),
			chapters: section({
				totals: [total(OAPEN_DOWNLOADS, '1')],
				countries: [country(OAPEN_DOWNLOADS, 'DE', '2')],
			}),
		});

		expect(combinedCountries(view(data))).toEqual([
			{
				countryCode: 'GB',
				countryName: 'United Kingdom of Great Britain and Northern Ireland',
				value: '9007199254740994',
			},
			{ countryCode: 'DE', countryName: 'Germany', value: '7' },
		]);
	});

	it('gives shares of the sum in the CSV', () => {
		const countries = combinedCountries(view(yearResponse()));

		expect(countriesCsv(countries)).toEqual([
			['Country', 'Value', 'Percentage'],
			['United Kingdom of Great Britain and Northern Ireland', '82', '62.12'],
			['United States of America', '50', '37.88'],
		]);
		expect(regionsCsv(countries)).toEqual([
			['Region', 'Value', 'Percentage'],
			['Europe', '82', '62.12'],
			['Northern America', '50', '37.88'],
		]);
	});

	it.each([
		[
			'a negative value',
			[
				country(OAPEN_DOWNLOADS, 'GB', '5'),
				country(OAPEN_DOWNLOADS, 'US', '-2'),
			],
			'Some country values for this work are negative, so they cannot be drawn as shares. The CSV export has the exact values.',
		],
		[
			'a zero sum',
			[
				country(OAPEN_DOWNLOADS, 'GB', '0'),
				country(OAPEN_DOWNLOADS, 'US', '0'),
			],
			'Every country value for this work is 0, so there are no shares to draw. The CSV export has the values.',
		],
	])('cannot draw shares with %s, and the CSV says n/a', (_name, rows, description) => {
		const countries = combinedCountries(
			view(
				response({
					work: section({
						totals: [total(OAPEN_DOWNLOADS, '1')],
						countries: rows,
					}),
				}),
			),
		);

		expect(sharesProblem(countries)).toEqual({
			title: 'Shares cannot be shown',
			description,
		});
		expect(
			countriesCsv(countries)
				.slice(1)
				.map((row) => row[2]),
		).toEqual(['n/a', 'n/a']);
		expect(
			regionsCsv(countries)
				.slice(1)
				.map((row) => row[2]),
		).toEqual(['n/a', 'n/a']);
	});
});

describe('no country breakdown note (per section, from rows only)', () => {
	it('does not name a pair that has country rows, whatever its coverage', () => {
		expect(noCountryBreakdownNote(view(yearResponse()))).toBe(
			'No country breakdown for: Open Book Publishers · Views (book).',
		);
	});

	it('names a pair (book) when its book section has no rows though its chapters section has, and the reverse (chapters)', () => {
		const data = response({
			work: section({
				totals: [total(OAPEN_DOWNLOADS, '4'), total(OBP_VIEWS, '3')],
				countries: [country(OBP_VIEWS, 'GB', '3')],
			}),
			chapters: section({
				totals: [total(OAPEN_DOWNLOADS, '2'), total(OBP_VIEWS, '1')],
				countries: [country(OAPEN_DOWNLOADS, 'GB', '2')],
			}),
		});

		expect(noCountryBreakdownNote(view(data))).toBe(
			'No country breakdown for: OAPEN · Downloads (book), Open Book Publishers · Views (chapters).',
		);
	});

	it('does not name a pair with a "0" or unknown total and no rows', () => {
		const data = response({
			work: section({
				totals: [total(OAPEN_DOWNLOADS, '0'), total(ZENODO_VIEWS, null)],
			}),
		});

		expect(noCountryBreakdownNote(view(data))).toBeNull();
	});

	it('uses no section suffix for a chapter embed', () => {
		const data = response({
			work: section({ totals: [total(OAPEN_DOWNLOADS, '4')] }),
		});

		expect(noCountryBreakdownNote(view(data, true))).toBe(
			'No country breakdown for: OAPEN · Downloads.',
		);
	});
});

describe('country names and regions', () => {
	it('names codes from ISO 3166-1 with the dashboard overrides', () => {
		expect(countryName('CD')).toBe('Democratic Republic of the Congo');
		expect(countryName('CG')).toBe('Republic of the Congo');
		expect(countryName('XK')).toBe('Kosovo');
		expect(countryName('FR')).toBe('France');
		expect(countryName('ZZ')).toBe('ZZ');
	});

	it('places XK in Europe and an unknown code in "Other or unknown region"', () => {
		expect(continentOf('XK')).toBe('Europe');
		expect(continentOf('ZZ')).toBe(UNKNOWN_REGION);
		expect(
			continentValues([
				{ countryCode: 'ZZ', countryName: 'ZZ', value: '1' },
				{ countryCode: 'XK', countryName: 'Kosovo', value: '2' },
				{ countryCode: 'BR', countryName: 'Brazil', value: '3' },
			]),
		).toEqual([
			{ continent: 'Latin America and the Caribbean', value: '3' },
			{ continent: 'Europe', value: '2' },
			{ continent: UNKNOWN_REGION, value: '1' },
		]);
	});

	it('resolves every map feature name to a country code (no unresolved names)', () => {
		const names = (
			geoData as unknown as {
				objects: Record<
					string,
					{ geometries: { properties: { name: string } }[] }
				>;
			}
		).objects;
		const featureNames = Object.values(names).flatMap(({ geometries }) =>
			geometries.map(({ properties }) => properties.name),
		);
		// Reviewed list of names that need no code: none.
		const unresolvedAllowed: string[] = [];

		expect(featureNames.length).toBe(202);
		expect(
			featureNames.filter(
				(name) =>
					countryCodeOf(name) === undefined &&
					!unresolvedAllowed.includes(name),
			),
		).toEqual([]);
	});
});
