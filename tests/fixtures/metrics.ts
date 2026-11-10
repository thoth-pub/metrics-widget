import type {
	MetricsByCountryDto,
	MetricsByMonthsSourceDto,
	MetricsByYearDto,
} from '@/shared/interfaces';

export const measure = (source: string, type: string, value: number) => ({
	measure_uri: `https://metrics.test/${source.toLowerCase().replace(/\W+/g, '-')}/${type}/v1`,
	namespace: 'test',
	source,
	type,
	version: '1',
	value,
});

/** Per-year metrics for the main work. */
export const yearlyBook: MetricsByYearDto[] = [
	{
		year: '2023',
		data: [
			measure('Google Books', 'views', 10),
			measure('Open Book Publishers', 'downloads', 4),
		],
	},
	{
		year: '2024',
		data: [
			measure('Google Books', 'views', 6),
			measure('Open Book Publishers HTML Reader', 'sessions', 5),
		],
	},
];

/** Per-year metrics for the chapters (all chunks concatenated). */
export const yearlyChapters: MetricsByYearDto[] = [
	{
		year: '2023',
		data: [
			measure('Google Books', 'views', 3),
			measure('Open Book Publishers', 'downloads', 1),
		],
	},
	{
		year: '2024',
		data: [measure('OAPEN', 'downloads', 8)],
	},
];

/** Per-month metrics (2024) for the main work. */
export const monthlyBook: MetricsByMonthsSourceDto[] = [
	{
		...measure('Google Books', 'views', 0),
		data: [
			{ month: '01', value: 4 },
			{ month: '03', value: 2 },
		],
	},
	{
		...measure('Open Book Publishers', 'downloads', 0),
		data: [{ month: '02', value: 7 }],
	},
];

/** Per-month metrics (2024) for the chapters. */
export const monthlyChapters: MetricsByMonthsSourceDto[] = [
	{
		...measure('Google Books', 'views', 0),
		data: [
			{ month: '03', value: 5 },
			{ month: '12', value: 1 },
		],
	},
	{
		// Same platform, different measure type: merged into one platform row.
		...measure('Google Books', 'downloads', 0),
		data: [{ month: '01', value: 10 }],
	},
];

const country = (
	country_name: string,
	country_code: string,
	continent_code: string,
	data: MetricsByCountryDto['data'],
): MetricsByCountryDto => ({
	country_uri: `urn:iso:std:iso:3166:-2:${country_code}`,
	country_code,
	country_name,
	continent_code,
	data,
});

/** Per-country metrics for the main work. */
export const countriesBook: MetricsByCountryDto[] = [
	country('Germany', 'DE', 'EU', [
		measure('Google Books', 'views', 10),
		measure('Open Book Publishers', 'downloads', 5),
	]),
	country('France', 'FR', 'EU', [measure('OAPEN', 'downloads', 20)]),
	country('United States of America', 'US', 'NA', [
		measure('Google Books', 'views', 30),
	]),
	// Platforms that do not track per-country data report an empty country name.
	country('', '', '', [measure('World Reader', 'users', 7)]),
];

/** Per-country metrics for the chapters. */
export const countriesChapters: MetricsByCountryDto[] = [
	country('Germany', 'DE', 'EU', [measure('Google Books', 'views', 2)]),
	country('Brazil', 'BR', 'SA', [measure('OAPEN', 'downloads', 4)]),
];
