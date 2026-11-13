import type {
	MetricWidgetCountryTotal,
	MetricWidgetData,
	MetricWidgetInput,
	MetricWidgetMeasure,
	MetricWidgetPlatform,
	MetricWidgetSection,
	MetricWidgetTimeBucket,
	MetricWidgetTotal,
} from '@/shared/interfaces';
import { monthBuckets, yearBuckets } from '@/shared/metricWidget';
import { jsonResponse } from '../helpers/fetch';

/** The clock most tests pin: `E` is then 2026-12-01 and the current month (Nov 2026) is included. */
export const NOW = new Date('2026-11-13T12:00:00Z');
export const E = '2026-12-01';
export const SERVED_START = '2019-03-01';

export const PLATFORMS = {
	/** Own token by its `code` slug (`mw-chart-metric-oapen`). */
	oapen: {
		platformId: '0a0a0a0a-0000-4000-8000-000000000001',
		code: 'oapen',
		displayName: 'OAPEN',
		publicDescription: 'Downloads from the OAPEN Library.',
	},
	/** Own token by its `displayName` slug (`mw-chart-metric-open-book-publishers`). */
	obp: {
		platformId: '0b0b0b0b-0000-4000-8000-000000000002',
		code: 'obp-website',
		displayName: 'Open Book Publishers',
		publicDescription: null,
	},
	/** No token of its own: takes a fallback token. */
	zenodo: {
		platformId: '0c0c0c0c-0000-4000-8000-000000000003',
		code: 'zenodo',
		displayName: 'Zenodo',
		publicDescription: 'Zenodo <b>record</b> statistics.',
	},
} satisfies Record<string, MetricWidgetPlatform>;

export const MEASURES = {
	downloads: {
		measureId: '1d1d1d1d-0000-4000-8000-000000000001',
		displayName: 'Downloads',
		definition: 'Times a file was downloaded.',
	},
	views: {
		measureId: '1e1e1e1e-0000-4000-8000-000000000002',
		displayName: 'Views',
		definition: 'Times a page was viewed.',
	},
} satisfies Record<string, MetricWidgetMeasure>;

export type Pair = { platformId: string; measureId: string };

export const pair = (
	platform: keyof typeof PLATFORMS,
	measure: keyof typeof MEASURES,
): Pair => ({
	platformId: PLATFORMS[platform].platformId,
	measureId: MEASURES[measure].measureId,
});

export const OAPEN_DOWNLOADS = pair('oapen', 'downloads');
export const OBP_VIEWS = pair('obp', 'views');
export const ZENODO_VIEWS = pair('zenodo', 'views');

export const total = (of: Pair, value: string | null): MetricWidgetTotal => ({
	...of,
	value,
});

export const bucket = (
	of: Pair,
	startDate: string,
	endDate: string,
	value: string | null,
): MetricWidgetTimeBucket => ({ ...of, startDate, endDate, value });

export const country = (
	of: Pair,
	countryCode: string,
	value: string,
): MetricWidgetCountryTotal => ({ ...of, countryCode, value });

/** A pair's timeline over every bucket of a range, from one value per bucket. */
export const series = (
	of: Pair,
	ranges: { startDate: string; endDate: string }[],
	values: (string | null)[],
): MetricWidgetTimeBucket[] =>
	ranges.map((range, index) =>
		bucket(of, range.startDate, range.endDate, values[index] ?? null),
	);

export const section = (
	parts: Partial<MetricWidgetSection> = {},
): MetricWidgetSection => ({
	totals: [],
	timeline: [],
	countries: [],
	...parts,
});

export const emptySection = () => section();

export const response = (
	parts: Partial<MetricWidgetData> = {},
): MetricWidgetData => ({
	work: emptySection(),
	chapters: null,
	excludedChildCount: 0,
	platforms: Object.values(PLATFORMS),
	measures: Object.values(MEASURES),
	startDate: SERVED_START,
	endDate: E,
	...parts,
});

export const YEAR_RANGES = yearBuckets(SERVED_START, E);

/** An R-YEAR response from 2019-03-01 to E (8 buckets) with data in both sections. */
export const yearResponse = (): MetricWidgetData =>
	response({
		work: section({
			totals: [total(OAPEN_DOWNLOADS, '120'), total(OBP_VIEWS, '30')],
			timeline: [
				...series(OAPEN_DOWNLOADS, YEAR_RANGES, [
					'10',
					'20',
					null,
					'0',
					'30',
					'20',
					'25',
					'15',
				]),
				...series(OBP_VIEWS, YEAR_RANGES, [
					'1',
					'2',
					'3',
					'4',
					'5',
					'5',
					'5',
					'5',
				]),
			],
			countries: [
				country(OAPEN_DOWNLOADS, 'GB', '70'),
				country(OAPEN_DOWNLOADS, 'US', '50'),
			],
		}),
		chapters: section({
			totals: [total(OAPEN_DOWNLOADS, '12')],
			timeline: series(OAPEN_DOWNLOADS, YEAR_RANGES, [
				'1',
				'1',
				'1',
				'1',
				'2',
				'2',
				'2',
				'2',
			]),
			countries: [country(OAPEN_DOWNLOADS, 'GB', '12')],
		}),
	});

/** An R-MONTH response for one bucket, serving OAPEN downloads in the work section. */
export const monthResponse = (
	startDate: string,
	endDate: string,
	value = '3',
): MetricWidgetData => {
	const months = monthBuckets(startDate, endDate);

	return response({
		startDate,
		endDate,
		work: section({
			totals: [total(OAPEN_DOWNLOADS, String(Number(value) * months.length))],
			timeline: series(
				OAPEN_DOWNLOADS,
				months,
				months.map(() => value),
			),
		}),
	});
};

/** A response that serves no pair in either section. */
export const emptyResponse = (
	startDate = '2026-10-01',
	endDate = E,
): MetricWidgetData => response({ startDate, endDate });

/** One-bucket R-YEAR (the work was first served in 2026). */
export const oneBucketResponse = (): MetricWidgetData => {
	const ranges = yearBuckets('2026-02-01', E);

	return response({
		startDate: '2026-02-01',
		work: section({
			totals: [total(OAPEN_DOWNLOADS, '9')],
			timeline: series(OAPEN_DOWNLOADS, ranges, ['9']),
		}),
	});
};

export const graphqlData = (metricWidget: unknown, status = 200) =>
	jsonResponse({ data: { metricWidget } }, status);

export const graphqlError = (type: string | undefined, status = 200) =>
	jsonResponse(
		{
			data: null,
			errors: [
				{
					message: 'A fixed error message.',
					...(type ? { extensions: { type } } : {}),
				},
			],
		},
		status,
	);

export type MetricWidgetHandler = (
	input: MetricWidgetInput,
) => Response | Promise<Response>;
