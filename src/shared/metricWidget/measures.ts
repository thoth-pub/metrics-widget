import { csvTextCell, csvValueCell } from './csv';
import type { MetricWidgetView, SectionId } from './view';

export type MeasureRow = {
	key: string;
	label: string;
	platformId: string;
	platformName: string;
	measureName: string;
	/** Per section: the exact total, `null` when unknown, and absent when the section does not serve the pair. */
	values: Partial<Record<SectionId, string | null>>;
};

/** One row per pair served in either section, in pair order (Measures tab). */
export const measureRows = (view: MetricWidgetView): MeasureRow[] =>
	view.pairs.map((pair) => {
		const values: MeasureRow['values'] = {};

		for (const section of view.sections) {
			if (section.totals.has(pair.key)) {
				values[section.id] = section.totals.get(pair.key) ?? null;
			}
		}

		return {
			key: pair.key,
			label: pair.label,
			platformId: pair.platformId,
			platformName: pair.platformName,
			measureName: pair.measureName,
			values,
		};
	});

/**
 * `Platform, Measure, Book, Chapters` for a book (a book whose `chapters` is null keeps both columns) or
 * `Platform, Measure, Chapter` for a chapter embed.
 */
export const measuresCsv = (view: MetricWidgetView): string[][] => {
	const sectionIds: SectionId[] = view.isChapterEmbed
		? ['work']
		: ['work', 'chapters'];
	const header = view.isChapterEmbed
		? ['Platform', 'Measure', 'Chapter']
		: ['Platform', 'Measure', 'Book', 'Chapters'];

	return [
		header,
		...measureRows(view).map((row) => [
			csvTextCell(row.platformName),
			csvTextCell(row.measureName),
			...sectionIds.map((id) => csvValueCell(row.values[id])),
		]),
	];
};
