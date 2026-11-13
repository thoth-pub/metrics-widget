import { describe, expect, it } from 'vitest';
import type { MetricWidgetData } from '@/shared/interfaces';
import {
	buildMetricWidgetView,
	infoEntries,
	type MetricWidgetView,
	measureRows,
	measuresCsv,
	timelineCsv,
	timelineRows,
	timelineSeries,
	viewCaptions,
} from '@/shared/metricWidget';
import {
	E,
	MEASURES,
	monthResponse,
	OAPEN_DOWNLOADS,
	OBP_VIEWS,
	PLATFORMS,
	response,
	section,
	series,
	total,
	YEAR_RANGES,
	yearResponse,
	ZENODO_VIEWS,
} from '../fixtures/metricWidget';

const yearView = (
	data: MetricWidgetData = yearResponse(),
	isChapterEmbed = false,
): MetricWidgetView => {
	const view = buildMetricWidgetView(data, { grain: 'YEAR', isChapterEmbed });

	if (!view) throw new Error('invalid view');

	return view;
};

const OAPEN_KEY = `${OAPEN_DOWNLOADS.platformId}/${OAPEN_DOWNLOADS.measureId}`;
const OBP_KEY = `${OBP_VIEWS.platformId}/${OBP_VIEWS.measureId}`;
const ZENODO_KEY = `${ZENODO_VIEWS.platformId}/${ZENODO_VIEWS.measureId}`;

describe('pairs: union, labels and order', () => {
	it('takes the union of the pairs both sections serve, keyed by IDs', () => {
		const view = yearView(
			response({
				work: section({ totals: [total(OBP_VIEWS, '1')] }),
				chapters: section({ totals: [total(OAPEN_DOWNLOADS, '2')] }),
			}),
		);

		expect(view.pairs.map(({ key }) => key)).toEqual([OAPEN_KEY, OBP_KEY]);
	});

	it('labels a pair "<platform> · <measure>" from the response and orders by platform then measure name', () => {
		const view = yearView(
			response({
				work: section({
					totals: [
						total(ZENODO_VIEWS, '1'),
						total(OBP_VIEWS, '1'),
						total(
							{ ...OAPEN_DOWNLOADS, measureId: MEASURES.views.measureId },
							'1',
						),
						total(OAPEN_DOWNLOADS, '1'),
					],
				}),
			}),
		);

		expect(view.pairs.map(({ label }) => label)).toEqual([
			'OAPEN · Downloads',
			'OAPEN · Views',
			'Open Book Publishers · Views',
			'Zenodo · Views',
		]);
	});

	it('adds an ID suffix to repeated labels and then orders by platform ID', () => {
		const twin = {
			platformId: 'ffffffff-twin-4000-8000-000000000009',
			code: 'oapen-mirror',
			displayName: 'OAPEN',
			publicDescription: null,
		};
		const view = yearView(
			response({
				platforms: [...Object.values(PLATFORMS), twin],
				work: section({
					totals: [
						total({ ...OAPEN_DOWNLOADS, platformId: twin.platformId }, '1'),
						total(OAPEN_DOWNLOADS, '1'),
					],
				}),
			}),
		);

		expect(view.pairs.map(({ label }) => label)).toEqual([
			'OAPEN · Downloads [0a0a0a0a/1d1d1d1d]',
			'OAPEN · Downloads [ffffffff/1d1d1d1d]',
		]);
	});

	it('names the sections Book and Chapters, or Chapter for a chapter embed', () => {
		expect(yearView().sections.map(({ name }) => name)).toEqual([
			'Book',
			'Chapters',
		]);
		expect(
			yearView(response({ work: section() }), true).sections.map(
				({ name }) => name,
			),
		).toEqual(['Chapter']);
	});

	it('fails the view of a chapter embed whose chapters section is not null', () => {
		expect(
			buildMetricWidgetView(yearResponse(), {
				grain: 'YEAR',
				isChapterEmbed: true,
			}),
		).toBeNull();
	});

	it('is empty when neither section serves a pair', () => {
		expect(yearView(response()).isEmpty).toBe(true);
	});
});

describe('Measures view', () => {
	it('gives each served pair its section totals, and nothing for a section that does not serve it', () => {
		const view = yearView();

		expect(measureRows(view).map(({ key, values }) => [key, values])).toEqual([
			[OAPEN_KEY, { work: '120', chapters: '12' }],
			[OBP_KEY, { work: '30' }],
		]);
		expect(measuresCsv(view)).toEqual([
			['Platform', 'Measure', 'Book', 'Chapters'],
			['OAPEN', 'Downloads', '120', '12'],
			['Open Book Publishers', 'Views', '30', ''],
		]);
	});

	it('keeps a defensive null total as unknown: no bar, "no data" in the CSV', () => {
		const view = yearView(
			response({ work: section({ totals: [total(OAPEN_DOWNLOADS, null)] }) }),
		);

		expect(measureRows(view)[0].values).toEqual({ work: null });
		expect(measuresCsv(view)[1]).toEqual(['OAPEN', 'Downloads', 'no data', '']);
	});

	it('keeps a value above 2^53 exact and writes "-5" as -5', () => {
		const view = yearView(
			response({
				work: section({
					totals: [
						total(OAPEN_DOWNLOADS, '9007199254740993'),
						total(OBP_VIEWS, '-5'),
					],
				}),
			}),
		);

		expect(measuresCsv(view).slice(1)).toEqual([
			['OAPEN', 'Downloads', '9007199254740993', ''],
			['Open Book Publishers', 'Views', '-5', ''],
		]);
	});

	it('guards text cells that would start a formula, with or without leading space', () => {
		const view = yearView(
			response({
				platforms: [
					{ ...PLATFORMS.oapen, displayName: '=HYPERLINK("x")' },
					{ ...PLATFORMS.obp, displayName: ' =1+1' },
				],
				work: section({
					totals: [total(OAPEN_DOWNLOADS, '1'), total(OBP_VIEWS, '2')],
				}),
			}),
		);

		expect(measuresCsv(view).slice(1)).toEqual([
			["' =1+1", 'Views', '2', ''],
			['"\'=HYPERLINK(""x"")"', 'Downloads', '1', ''],
		]);
	});

	it('has one Chapter column for a chapter embed', () => {
		const view = yearView(
			response({ work: section({ totals: [total(OAPEN_DOWNLOADS, '7')] }) }),
			true,
		);

		expect(measuresCsv(view)).toEqual([
			['Platform', 'Measure', 'Chapter'],
			['OAPEN', 'Downloads', '7'],
		]);
	});

	it('keeps both columns for a book whose chapters section is null', () => {
		const view = yearView(
			response({
				work: section({ totals: [total(OAPEN_DOWNLOADS, '7')] }),
				chapters: null,
			}),
		);

		expect(measuresCsv(view)).toEqual([
			['Platform', 'Measure', 'Book', 'Chapters'],
			['OAPEN', 'Downloads', '7', ''],
		]);
	});
});

describe('Timeline view', () => {
	it('has one series per pair and section, keyed by IDs and named "<label> (<section>)"', () => {
		const series = timelineSeries(yearView());

		expect(series.map(({ id, name }) => [id, name])).toEqual([
			[`${OAPEN_KEY}|work`, 'OAPEN · Downloads (Book)'],
			[`${OAPEN_KEY}|chapters`, 'OAPEN · Downloads (Chapters)'],
			[`${OBP_KEY}|work`, 'Open Book Publishers · Views (Book)'],
		]);
	});

	it('keeps null as null (a gap) and draws "0" as 0', () => {
		const view = yearView();
		const series = timelineSeries(view);
		const rows = timelineRows(view, series);

		expect(series[0].values.slice(2, 4)).toEqual([null, '0']);
		expect(rows[2].s0).toBeNull();
		expect(rows[3].s0).toBe(0);
	});

	it('shows a missing expected bucket as unknown, never as 0', () => {
		const data = yearResponse();

		data.work.timeline = data.work.timeline.filter(
			(row) =>
				!(
					row.platformId === OBP_VIEWS.platformId &&
					row.startDate === '2021-01-01'
				),
		);

		const obp = timelineSeries(yearView(data)).find(
			({ pairKey }) => pairKey === OBP_KEY,
		);

		expect(obp?.values[2]).toBeNull();
	});

	it('never shows a pair in a section that does not serve it', () => {
		const ids = timelineSeries(yearView()).map(({ id }) => id);

		expect(ids).not.toContain(`${OBP_KEY}|chapters`);
	});

	it('writes every bucket as a CSV column and follows the series filter', () => {
		const view = yearView();
		const filtered = timelineSeries(view, new Set([OBP_KEY]));

		expect(timelineCsv(view, filtered)).toEqual([
			[
				'Platform',
				'Measure',
				'Section',
				'2019 (Mar–Dec)',
				'2020',
				'2021',
				'2022',
				'2023',
				'2024',
				'2025',
				'2026 (Jan–Nov)',
			],
			[
				'Open Book Publishers',
				'Views',
				'Book',
				'1',
				'2',
				'3',
				'4',
				'5',
				'5',
				'5',
				'5',
			],
		]);
		expect(timelineCsv(view, timelineSeries(view))[1].slice(0, 6)).toEqual([
			'OAPEN',
			'Downloads',
			'Book',
			'10',
			'20',
			'no data',
		]);
	});

	it('builds the month view from the MONTH response only, with its own pairs', () => {
		const month = buildMetricWidgetView(monthResponse('2026-01-01', E), {
			grain: 'MONTH',
			isChapterEmbed: false,
		});

		if (!month) throw new Error('invalid view');

		const selected = new Set([OAPEN_KEY, OBP_KEY]);
		const series = timelineSeries(month, selected);

		expect(month.buckets.map(({ label }) => label)).toEqual([
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
		]);
		// The filter keeps OBP selected, but R-MONTH does not serve it: it is not drawn (never as 0).
		expect(series.map(({ pairKey }) => pairKey)).toEqual([OAPEN_KEY]);
		expect(timelineCsv(month, series)[0].slice(3)).toHaveLength(11);
	});

	it('the year view never reads MONTH buckets', () => {
		const data = yearResponse();
		const view = yearView(data);

		expect(view.buckets).toHaveLength(YEAR_RANGES.length);
		expect(view.grain).toBe('YEAR');
	});

	it('names the chapter embed section "Chapter"', () => {
		const view = yearView(
			response({
				work: section({
					totals: [total(OAPEN_DOWNLOADS, '1')],
					timeline: series(OAPEN_DOWNLOADS, YEAR_RANGES, []),
				}),
			}),
			true,
		);

		expect(timelineSeries(view).map(({ name }) => name)).toEqual([
			'OAPEN · Downloads (Chapter)',
		]);
	});
});

describe('info entries and captions', () => {
	it('lists only the served pairs, with the definition and the public description when present', () => {
		const view = yearView(
			response({
				work: section({
					totals: [total(ZENODO_VIEWS, '1'), total(OBP_VIEWS, '1')],
				}),
			}),
		);

		expect(infoEntries(view)).toEqual([
			{
				key: OBP_KEY,
				title: 'Open Book Publishers · Views',
				definition: 'Times a page was viewed.',
				description: null,
			},
			{
				key: ZENODO_KEY,
				title: 'Zenodo · Views',
				definition: 'Times a page was viewed.',
				description: 'Zenodo <b>record</b> statistics.',
			},
		]);
	});

	it('states the period and, when chapters were left out, how many', () => {
		expect(viewCaptions(yearView())).toEqual(['Mar 2019 – Nov 2026']);
		expect(
			viewCaptions(yearView({ ...yearResponse(), excludedChildCount: 2 })),
		).toEqual([
			'Mar 2019 – Nov 2026',
			'2 chapter(s) from another publisher not included.',
		]);
	});
});
