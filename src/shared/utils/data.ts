import { config } from '../config';

export const updateSource = (source: string) => {
	const shouldUpdate = config.charts.sourcesForUpdate.find((label) =>
		source.startsWith(label.platform),
	);

	return shouldUpdate
		? source.replace(shouldUpdate.platform, shouldUpdate.label)
		: source;
};

export const getColor = (source: string) => {
	const sourceKey = source.toLowerCase();
	const defaultColor = config.charts.defaultMetricsChartColor;
	const color =
		config.charts.metricsChartColors[
			sourceKey as keyof typeof config.charts.metricsChartColors
		];

	return color ?? defaultColor;
};

export const isChapter = (workType: string) => {
	return workType === 'BOOK_CHAPTER';
};
