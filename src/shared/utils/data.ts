import { scaleLinear } from 'd3-scale';
import iso from 'iso-3166-1';
import { config } from '../config';

const {
	charts: {
		sourcesForUpdate,
		mapChartColors,
		defaultMetricsChartColor,
		metricsChartColors,
	},
} = config;

export const updateSource = (source: string) => {
	const shouldUpdate = sourcesForUpdate.find((label) =>
		source.startsWith(label.platform),
	);

	return shouldUpdate
		? source.replace(shouldUpdate.platform, shouldUpdate.label)
		: source;
};

export const getColor = (source: string) => {
	const sourceKey = source.toLowerCase();
	const defaultColor = defaultMetricsChartColor;
	const color =
		config.charts.metricsChartColors[
			sourceKey as keyof typeof metricsChartColors
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

export const getSaturationValue = ({
	topValue,
	itemValue,
}: {
	topValue: number;
	itemValue: number;
}) => {
	const filterValue = (itemValue * 100) / topValue;

	return filterValue;
};

export const getChartColorByPercentage = ({
	highestValue,
	lowestValue,
}: {
	highestValue: number;
	lowestValue: number;
}) => {
	if (lowestValue === 0) return mapChartColors.zeroValue;

	const percentage = getSaturationValue({
		topValue: highestValue,
		itemValue: lowestValue,
	});
	const colorScale = scaleLinear()
		.domain([0, 100])
		// @ts-expect-error d3-scale types issue
		.range([mapChartColors.lowestValue, mapChartColors.highestValue]);

	const color = colorScale(percentage);

	return color.toString();
};

export const getApiCountryName = (name: string) => {
	switch (name.toLowerCase()) {
		case "côte d'ivoire ":
			return "Cote d'ivoire Ivory Coast";
		case 'czechia':
			return 'Czech Republic';
		case 'united kingdom of great britain and northern ireland':
			return 'United Kingdom';
		case 'republic of korea':
			return 'South Korea';
		case "democratic people's republic of korea":
			return 'North Korea';
		case 'moldova':
			return 'Moldava';
		case 'myanmar':
			return 'Myanmar Burma';
		case 'philippines':
			return 'Phillipines';
		case 'russian federation':
			return 'Russia';
		case 'syrian arab republic':
			return 'Syria';
		case 'türkiye':
			return 'Turkey';
		case 'viet nam':
			return 'Vietnam';
		default:
			return name;
	}
};

export const convertMonthToKey = (month: string) => {
	switch (month.toLowerCase()) {
		case '01':
			return 'Jan';
		case '02':
			return 'Feb';
		case '03':
			return 'Mar';
		case '04':
			return 'Apr';
		case '05':
			return 'May';
		case '06':
			return 'Jun';
		case '07':
			return 'Jul';
		case '08':
			return 'Aug';
		case '09':
			return 'Sep';
		case '10':
			return 'Oct';
		case '11':
			return 'Nov';
		case '12':
			return 'Dec';
		default:
			return month;
	}
};
