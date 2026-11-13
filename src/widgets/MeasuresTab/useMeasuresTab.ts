import {
	type Doi,
	measureRows,
	measuresCsv,
	toChartNumber,
	useMetricWidgetYear,
	viewCaptions,
} from '@/shared';

export type Measure = {
	key: string;
	name: string;
	/** For drawing; `null` draws no bar. */
	book: number | null;
	chapters: number | null;
	/** Exact totals for the tooltip: `null` is unknown, `undefined` is not served by that section. */
	bookValue: string | null | undefined;
	chaptersValue: string | null | undefined;
	fill: string;
	patternKey: string;
};

/** A pattern ID part from a pair key: never a colour string. */
const sanitize = (key: string) => key.replace(/[^A-Za-z0-9_-]/g, '_');

export const useMeasuresTab = (doi: Doi) => {
	const year = useMetricWidgetYear(doi);
	const { view } = year;

	const measures: Measure[] = view
		? measureRows(view).map((row) => ({
				key: row.key,
				name: row.label,
				book: toChartNumber(row.values.work),
				chapters: toChartNumber(row.values.chapters),
				bookValue: row.values.work,
				chaptersValue: row.values.chapters,
				fill: year.colorOf(row.platformId),
				patternKey: sanitize(row.key),
			}))
		: [];

	return {
		year,
		measures,
		hasChaptersSection:
			view?.sections.some(({ id }) => id === 'chapters') ?? false,
		isChapterEmbed: year.isChapterEmbed,
		csvData: view ? measuresCsv(view) : undefined,
		captions: view && !view.isEmpty ? viewCaptions(view) : [],
	};
};
