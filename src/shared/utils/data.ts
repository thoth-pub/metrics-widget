import iso from 'iso-3166-1';
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

export const roundPercentage = (percentage: number) => {
	return percentage.toFixed(2).replace('.00', '');
};

export const getAlignedCountryName = (name: string) => {
	const updatedName = iso.whereCountry(name)?.country ?? name;

	switch (name.toLowerCase()) {
		case "cote d'ivoire ivory coast":
			return "Côte d'Ivoire";
		case 'czech republic':
			return 'Czechia';
		case 'united kingdom':
			return 'United Kingdom of Great Britain and Northern Ireland';
		case 'south korea':
			return 'Republic of Korea';
		case 'north korea':
			return "Democratic People's Republic of Korea";
		case 'moldava':
			return 'Moldova';
		case 'myanmar burma':
			return 'Myanmar';
		case 'phillipines':
			return 'Philippines';
		case 'russia':
			return 'Russian Federation';
		case 'syria':
			return 'Syrian Arab Republic';
		case 'turkey':
			return 'Türkiye';
		case 'vietnam':
			return 'Viet Nam';
		default:
			return updatedName;
	}
};

export const getPercentage = (totalMetrics: number, totalCount: number) => {
	if (totalCount === 0) return 0;

	return (totalMetrics / totalCount) * 100;
};

export const getContinentNameByCode = (continentCode: string) => {
	switch (continentCode.toLowerCase()) {
		case 'af':
			return 'Africa';
		case 'as':
			return 'Asia';
		case 'eu':
			return 'Europe';
		case 'na':
			return 'Northern America';
		case 'an':
			return 'Antarctica';
		case 'sa':
			return 'Latin America and the Caribbean';
		case 'la':
			return 'Latin America and the Caribbean';
		case 'oc':
			return 'Oceania';
		default:
			return continentCode;
	}
};
