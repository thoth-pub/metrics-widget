import { monthViewCaption, periodCaption } from './dates';
import type { MetricWidgetBucket, MetricWidgetView } from './view';

export type InfoEntry = {
	key: string;
	title: string;
	definition: string;
	description: string | null;
};

/**
 * The info panel: each served pair of the read the tab shows, labelled as in the charts, with its measure
 * definition and then the platform's public description when it has one (rendered as plain text).
 */
export const infoEntries = (view: MetricWidgetView | null): InfoEntry[] =>
	(view?.pairs ?? []).map((pair) => ({
		key: pair.key,
		title: pair.label,
		definition: pair.definition,
		description: pair.publicDescription,
	}));

/**
 * The captions of a view with data: the period it covers (or `<bucket> by month` in the month view) and, when
 * some selected chapters belong to another publisher, how many were left out. Nothing says whether values are
 * complete: the widget shows what is served.
 */
export const viewCaptions = (
	view: MetricWidgetView,
	monthBucket?: MetricWidgetBucket,
): string[] => {
	const captions = [
		monthBucket ? monthViewCaption(monthBucket) : periodCaption(view),
	];

	if (view.excludedChildCount > 0) {
		captions.push(
			`${view.excludedChildCount} chapter(s) from another publisher not included.`,
		);
	}

	return captions;
};
