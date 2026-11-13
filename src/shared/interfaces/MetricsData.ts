// Thoth `metricWidget` (register section 4.4): the subset of the response the widget selects.
// Values are exact base-10 strings (`BigInt`); `null` is unknown and is never shown as zero.

export type MetricWidgetGrain = 'MONTH' | 'YEAR';

export type MetricWidgetInput = {
	doi: string;
	chapterDois?: string[];
	startDate?: string;
	endDate: string;
	timelineGrain: MetricWidgetGrain;
};

export type MetricWidgetTotal = {
	platformId: string;
	measureId: string;
	value: string | null;
};

export type MetricWidgetTimeBucket = {
	platformId: string;
	measureId: string;
	startDate: string;
	endDate: string;
	value: string | null;
};

export type MetricWidgetCountryTotal = {
	platformId: string;
	measureId: string;
	countryCode: string;
	value: string;
};

export type MetricWidgetSection = {
	totals: MetricWidgetTotal[];
	timeline: MetricWidgetTimeBucket[];
	countries: MetricWidgetCountryTotal[];
};

export type MetricWidgetPlatform = {
	platformId: string;
	code: string;
	displayName: string;
	publicDescription: string | null;
};

export type MetricWidgetMeasure = {
	measureId: string;
	displayName: string;
	definition: string;
};

export type MetricWidgetData = {
	work: MetricWidgetSection;
	chapters: MetricWidgetSection | null;
	excludedChildCount: number;
	platforms: MetricWidgetPlatform[];
	measures: MetricWidgetMeasure[];
	startDate: string;
	endDate: string;
};
