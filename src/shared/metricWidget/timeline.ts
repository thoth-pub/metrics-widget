import { csvTextCell, csvValueCell } from './csv';
import {
	type MetricWidgetView,
	type SectionId,
	type SectionName,
	toChartNumber,
} from './view';

export type TimelineSeries = {
	/** `<pair key>|<section>`. */
	id: string;
	/** The chart row key of this series (`s<n>`): never derived from a label. */
	dataKey: string;
	pairKey: string;
	platformId: string;
	platformName: string;
	measureName: string;
	sectionId: SectionId;
	sectionName: SectionName;
	/** `<label> (<section>)`. */
	name: string;
	/** One exact value per bucket of the view; `null` is unknown and is drawn as a gap. */
	values: (string | null)[];
};

/**
 * One series per pair and section the view serves, in pair order then section order (Book or Chapter, then
 * Chapters), keeping only the pairs of `selectedPairKeys` when it is not empty.
 */
export const timelineSeries = (
	view: MetricWidgetView,
	selectedPairKeys: ReadonlySet<string> = new Set(),
): TimelineSeries[] => {
	const series: TimelineSeries[] = [];

	for (const pair of view.pairs) {
		if (selectedPairKeys.size > 0 && !selectedPairKeys.has(pair.key)) continue;

		for (const section of view.sections) {
			const values = section.timeline.get(pair.key);

			if (!values) continue;

			series.push({
				id: `${pair.key}|${section.id}`,
				dataKey: `s${series.length}`,
				pairKey: pair.key,
				platformId: pair.platformId,
				platformName: pair.platformName,
				measureName: pair.measureName,
				sectionId: section.id,
				sectionName: section.name,
				name: `${pair.label} (${section.name})`,
				values,
			});
		}
	}

	return series;
};

export type TimelineRow = {
	index: number;
	label: string;
	[dataKey: string]: number | string | null;
};

/** One chart row per bucket, holding each series' value as a number for drawing (`null` stays `null`). */
export const timelineRows = (
	view: MetricWidgetView,
	series: TimelineSeries[],
): TimelineRow[] =>
	view.buckets.map((bucket, index) => {
		const row: TimelineRow = { index, label: bucket.label };

		for (const { dataKey, values } of series) {
			row[dataKey] = toChartNumber(values[index]);
		}

		return row;
	});

/** `Platform, Measure, Section, <every bucket>`: one row per series, whatever the page. */
export const timelineCsv = (
	view: MetricWidgetView,
	series: TimelineSeries[],
): string[][] => [
	[
		'Platform',
		'Measure',
		'Section',
		...view.buckets.map(({ label }) => csvTextCell(label)),
	],
	...series.map((item) => [
		csvTextCell(item.platformName),
		csvTextCell(item.measureName),
		csvTextCell(item.sectionName),
		...item.values.map(csvValueCell),
	]),
];
