import type {
	MetricWidgetCountryTotal,
	MetricWidgetData,
	MetricWidgetInput,
	MetricWidgetMeasure,
	MetricWidgetPlatform,
	MetricWidgetSection,
	MetricWidgetTimeBucket,
	MetricWidgetTotal,
} from '../../interfaces/MetricsData';
import {
	isFirstOfMonth,
	monthBuckets,
	yearBuckets,
} from '../../metricWidget/dates';
import { MetricWidgetFailedError } from './errors';

// Fails closed (WIDGET-02 specification section 7.2): any response that breaks one of these rules is rejected
// whole, and nothing of it is drawn. Only the selected fields are copied, so nothing else reaches the view.

const CANONICAL_INTEGER = /^(0|-?[1-9][0-9]*)$/;
const COUNTRY_CODE = /^[A-Z]{2}$/;
const MIN_START_DATE = '2000-01-01';

class InvalidResponse extends Error {}

const fail = (): never => {
	throw new InvalidResponse();
};

type UnknownRecord = Record<string, unknown>;

const record = (value: unknown): UnknownRecord =>
	typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as UnknownRecord)
		: fail();

const list = (value: unknown): unknown[] =>
	Array.isArray(value) ? value : fail();

const text = (value: unknown): string =>
	typeof value === 'string' ? value : fail();

const id = (value: unknown): string => {
	const result = text(value);

	return result.length > 0 ? result : fail();
};

const nullableText = (value: unknown): string | null =>
	value === null ? null : text(value);

const integer = (value: unknown): string =>
	typeof value === 'string' && CANONICAL_INTEGER.test(value) ? value : fail();

const nullableInteger = (value: unknown): string | null =>
	value === null ? null : integer(value);

export const pairKeyOf = ({
	platformId,
	measureId,
}: {
	platformId: string;
	measureId: string;
}) => `${platformId}/${measureId}`;

type Labels = {
	platformIds: Set<string>;
	measureIds: Set<string>;
};

const parseSection = (
	value: unknown,
	labels: Labels,
	expectedBuckets: Set<string>,
): MetricWidgetSection => {
	const section = record(value);
	const pairs = new Set<string>();

	const totals: MetricWidgetTotal[] = list(section.totals).map((raw) => {
		const row = record(raw);
		const total = {
			platformId: id(row.platformId),
			measureId: id(row.measureId),
			value: nullableInteger(row.value),
		};
		const key = pairKeyOf(total);

		if (pairs.has(key)) fail();
		if (!labels.platformIds.has(total.platformId)) fail();
		if (!labels.measureIds.has(total.measureId)) fail();

		pairs.add(key);

		return total;
	});

	const buckets = new Set<string>();
	const timeline: MetricWidgetTimeBucket[] = list(section.timeline).map(
		(raw) => {
			const row = record(raw);
			const bucket = {
				platformId: id(row.platformId),
				measureId: id(row.measureId),
				startDate: text(row.startDate),
				endDate: text(row.endDate),
				value: nullableInteger(row.value),
			};
			const range = `${bucket.startDate}/${bucket.endDate}`;
			const key = `${pairKeyOf(bucket)}@${range}`;

			if (!pairs.has(pairKeyOf(bucket))) fail();
			if (!expectedBuckets.has(range)) fail();
			if (buckets.has(key)) fail();

			buckets.add(key);

			return bucket;
		},
	);

	const countryKeys = new Set<string>();
	const countries: MetricWidgetCountryTotal[] = list(section.countries).map(
		(raw) => {
			const row = record(raw);
			const country = {
				platformId: id(row.platformId),
				measureId: id(row.measureId),
				countryCode: text(row.countryCode),
				value: integer(row.value),
			};
			const key = `${pairKeyOf(country)}@${country.countryCode}`;

			if (!pairs.has(pairKeyOf(country))) fail();
			if (!COUNTRY_CODE.test(country.countryCode)) fail();
			if (countryKeys.has(key)) fail();

			countryKeys.add(key);

			return country;
		},
	);

	return { totals, timeline, countries };
};

const parsePlatforms = (value: unknown): MetricWidgetPlatform[] => {
	const ids = new Set<string>();

	return list(value).map((raw) => {
		const row = record(raw);
		const platform = {
			platformId: id(row.platformId),
			code: text(row.code),
			displayName: text(row.displayName),
			publicDescription: nullableText(row.publicDescription),
		};

		if (ids.has(platform.platformId)) fail();

		ids.add(platform.platformId);

		return platform;
	});
};

const parseMeasures = (value: unknown): MetricWidgetMeasure[] => {
	const ids = new Set<string>();

	return list(value).map((raw) => {
		const row = record(raw);
		const measure = {
			measureId: id(row.measureId),
			displayName: text(row.displayName),
			definition: text(row.definition),
		};

		if (ids.has(measure.measureId)) fail();

		ids.add(measure.measureId);

		return measure;
	});
};

const parseDates = (response: UnknownRecord, input: MetricWidgetInput) => {
	const startDate = text(response.startDate);
	const endDate = text(response.endDate);

	if (endDate !== input.endDate) fail();

	if (input.timelineGrain === 'YEAR') {
		if (!isFirstOfMonth(startDate)) fail();
		if (startDate < MIN_START_DATE) fail();
		if (startDate >= endDate) fail();
	} else if (startDate !== input.startDate) {
		fail();
	}

	return { startDate, endDate };
};

/**
 * Validates one `metricWidget` response against the request it answers, or throws a `MetricWidgetFailedError`
 * (`INVALID_RESPONSE`). The chapter-embed rule (`chapters` is null) is checked by the view model, once the
 * metadata read has settled.
 */
export const validateMetricWidget = (
	value: unknown,
	input: MetricWidgetInput,
): MetricWidgetData => {
	try {
		const response = record(value);
		const { startDate, endDate } = parseDates(response, input);
		const platforms = parsePlatforms(response.platforms);
		const measures = parseMeasures(response.measures);
		const labels: Labels = {
			platformIds: new Set(platforms.map(({ platformId }) => platformId)),
			measureIds: new Set(measures.map(({ measureId }) => measureId)),
		};
		const buckets =
			input.timelineGrain === 'YEAR'
				? yearBuckets(startDate, endDate)
				: monthBuckets(startDate, endDate);
		const expectedBuckets = new Set(
			buckets.map((bucket) => `${bucket.startDate}/${bucket.endDate}`),
		);
		const excludedChildCount = response.excludedChildCount;

		if (
			typeof excludedChildCount !== 'number' ||
			!Number.isInteger(excludedChildCount) ||
			excludedChildCount < 0
		) {
			fail();
		}

		return {
			work: parseSection(response.work, labels, expectedBuckets),
			chapters:
				response.chapters === null
					? null
					: parseSection(response.chapters, labels, expectedBuckets),
			excludedChildCount: excludedChildCount as number,
			platforms,
			measures,
			startDate,
			endDate,
		};
	} catch {
		throw new MetricWidgetFailedError('INVALID_RESPONSE');
	}
};
