import {
	config,
	type Doi,
	getContinentNameByCode,
	getPercentage,
	roundPercentage,
	useMetricsByCountryOrRegion,
} from '@/shared';

export const useRegionsTab = (doi: Doi) => {
	const {
		metaData,
		preProcessedData,
		totalCount,
		selectedPlatforms,
		platformOptions,
		isLoading,
		setSelectedPlatforms,
	} = useMetricsByCountryOrRegion({
		doi,
		type: 'continent_code',
	});

	const sortedData = Object.entries(preProcessedData).sort(
		(a, b) => b[1] - a[1],
	);

	const processedData = sortedData.map(([region, value], index) => {
		const percentage = getPercentage(value, totalCount);

		return {
			name: getContinentNameByCode(region),
			metrics: value,
			percentage,
			fill: `var(--color-countries-${index + 1})`,
		};
	});

	const processedCsvData = processedData.map(({ name, percentage }) => [
		name,
		roundPercentage(percentage),
	]);

	const csvData: string[][] = [config.csv.regionsHeader, ...processedCsvData];

	return {
		metaData,
		metricsData: processedData,
		csvData,
		selectPlatform: setSelectedPlatforms,
		selectedPlatforms,
		platformOptions,
		isLoading,
	};
};
