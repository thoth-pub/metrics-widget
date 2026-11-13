import { config } from '../config';
import type {
	MetricWidgetCountryTotal,
	MetricWidgetData,
	MetricWidgetGrain,
	MetricWidgetPlatform,
	MetricWidgetSection,
} from '../interfaces/MetricsData';
import {
	type DateRange,
	monthBuckets,
	monthName,
	yearBucketLabel,
	yearBuckets,
} from './dates';

// Turns one validated `metricWidget` response into what the tabs draw and export.
//
// Rules (WIDGET-02 specification sections 6 and 7.1): every series, bar and total is one platform and measure
// pair of one section, identified by IDs, and is never summed with another pair (geography excepted); values stay
// exact strings; `null` (unknown) is never turned into zero; a pair a section does not serve is not shown for
// that section at all.

export type SectionId = 'work' | 'chapters';
export type SectionName = 'Book' | 'Chapters' | 'Chapter';

export type MetricWidgetPair = {
	/** `platformId/measureId`. */
	key: string;
	platformId: string;
	measureId: string;
	platformName: string;
	measureName: string;
	/** `<platform> · <measure>`, with an ID suffix when two served pairs share it. */
	label: string;
	definition: string;
	publicDescription: string | null;
};

export type MetricWidgetBucket = DateRange & { label: string };

export type MetricWidgetViewSection = {
	id: SectionId;
	name: SectionName;
	/** Served pairs (by key) and their totals. */
	totals: Map<string, string | null>;
	/** Served pairs (by key) and their values, one per bucket; a missing bucket is unknown (`null`). */
	timeline: Map<string, (string | null)[]>;
	countries: MetricWidgetCountryTotal[];
};

export type MetricWidgetView = {
	grain: MetricWidgetGrain;
	isChapterEmbed: boolean;
	startDate: string;
	endDate: string;
	buckets: MetricWidgetBucket[];
	/** The work section first, then the chapters section when the response has one. */
	sections: MetricWidgetViewSection[];
	/** Every pair served in either section, in display order. */
	pairs: MetricWidgetPair[];
	/** The platforms of the served pairs, in platform order (display name, then ID). */
	platforms: MetricWidgetPlatform[];
	excludedChildCount: number;
	/** True when neither section serves a pair. */
	isEmpty: boolean;
};

export const pairKey = ({
	platformId,
	measureId,
}: {
	platformId: string;
	measureId: string;
}) => `${platformId}/${measureId}`;

const compareText = (a: string, b: string) => a.localeCompare(b, 'en');

const compareCodeUnits = (a: string, b: string) => {
	if (a === b) return 0;

	return a < b ? -1 : 1;
};

/** Platform order: display name (locale `en`), then platform ID. */
export const comparePlatforms = (
	a: Pick<MetricWidgetPlatform, 'displayName' | 'platformId'>,
	b: Pick<MetricWidgetPlatform, 'displayName' | 'platformId'>,
) =>
	compareText(a.displayName, b.displayName) ||
	compareCodeUnits(a.platformId, b.platformId);

/** Pair order: platform name, then measure name (locale `en`), then platform ID, then measure ID. */
const comparePairs = (a: MetricWidgetPair, b: MetricWidgetPair) =>
	compareText(a.platformName, b.platformName) ||
	compareText(a.measureName, b.measureName) ||
	compareCodeUnits(a.platformId, b.platformId) ||
	compareCodeUnits(a.measureId, b.measureId);

const sectionView = (
	id: SectionId,
	name: SectionName,
	section: MetricWidgetSection,
	buckets: DateRange[],
): MetricWidgetViewSection => {
	const index = new Map(
		buckets.map((bucket, position) => [
			`${bucket.startDate}/${bucket.endDate}`,
			position,
		]),
	);
	const totals = new Map(
		section.totals.map((total) => [pairKey(total), total.value]),
	);
	const timeline = new Map<string, (string | null)[]>(
		[...totals.keys()].map((key) => [key, buckets.map(() => null)]),
	);

	for (const bucket of section.timeline) {
		const values = timeline.get(pairKey(bucket));
		const position = index.get(`${bucket.startDate}/${bucket.endDate}`);

		if (values && position !== undefined) values[position] = bucket.value;
	}

	return { id, name, totals, timeline, countries: section.countries };
};

const labelSeparator = config.charts.timeMetricsChartLabelSeparator;

export type BuildViewOptions = {
	grain: MetricWidgetGrain;
	isChapterEmbed: boolean;
};

/**
 * Builds the view of one validated response, or returns `null` when it breaks the rule that can only be checked
 * once the metadata read has settled: a chapter embed's `chapters` section is null.
 */
export const buildMetricWidgetView = (
	data: MetricWidgetData,
	{ grain, isChapterEmbed }: BuildViewOptions,
): MetricWidgetView | null => {
	if (isChapterEmbed && data.chapters !== null) return null;

	const ranges =
		grain === 'YEAR'
			? yearBuckets(data.startDate, data.endDate)
			: monthBuckets(data.startDate, data.endDate);
	const buckets = ranges.map((range) => ({
		...range,
		label:
			grain === 'YEAR' ? yearBucketLabel(range) : monthName(range.startDate),
	}));

	const sections = [
		sectionView(
			'work',
			isChapterEmbed ? 'Chapter' : 'Book',
			data.work,
			ranges,
		),
	];

	if (data.chapters !== null) {
		sections.push(sectionView('chapters', 'Chapters', data.chapters, ranges));
	}

	const platforms = new Map(
		data.platforms.map((platform) => [platform.platformId, platform]),
	);
	const measures = new Map(
		data.measures.map((measure) => [measure.measureId, measure]),
	);
	const served = new Map<string, { platformId: string; measureId: string }>();

	for (const section of [data.work, data.chapters]) {
		for (const total of section?.totals ?? []) {
			served.set(pairKey(total), total);
		}
	}

	const pairs: MetricWidgetPair[] = [...served.entries()].map(
		([key, { platformId, measureId }]) => {
			const platform = platforms.get(platformId);
			const measure = measures.get(measureId);
			const platformName = platform?.displayName ?? '';
			const measureName = measure?.displayName ?? '';

			return {
				key,
				platformId,
				measureId,
				platformName,
				measureName,
				label: `${platformName}${labelSeparator}${measureName}`,
				definition: measure?.definition ?? '',
				publicDescription: platform?.publicDescription ?? null,
			};
		},
	);

	const labelCounts = new Map<string, number>();

	for (const pair of pairs) {
		labelCounts.set(pair.label, (labelCounts.get(pair.label) ?? 0) + 1);
	}

	for (const pair of pairs) {
		if ((labelCounts.get(pair.label) ?? 0) > 1) {
			pair.label = `${pair.label} [${pair.platformId.slice(0, 8)}/${pair.measureId.slice(0, 8)}]`;
		}
	}

	pairs.sort(comparePairs);

	const servedPlatforms = [
		...new Set(pairs.map(({ platformId }) => platformId)),
	]
		.map((platformId) => platforms.get(platformId))
		.filter((platform) => platform !== undefined)
		.sort(comparePlatforms);

	return {
		grain,
		isChapterEmbed,
		startDate: data.startDate,
		endDate: data.endDate,
		buckets,
		sections,
		pairs,
		platforms: servedPlatforms,
		excludedChildCount: data.excludedChildCount,
		isEmpty: pairs.length === 0,
	};
};

/** For drawing only: exact values stay strings everywhere else. */
export const toChartNumber = (value: string | null | undefined) =>
	value === null || value === undefined ? null : Number(value);
