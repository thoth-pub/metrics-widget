import {
	config,
	type Doi,
	getContinentNameByCode,
	getIncludedSources,
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
		dataType: 'continent',
	});

	const processedData = preProcessedData.map(([region, value], index) => {
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

	const includedSources = getIncludedSources(
		selectedPlatforms,
		platformOptions,
	);

	return {
		metaData,
		metricsData: processedData,
		csvData,
		selectPlatform: setSelectedPlatforms,
		selectedPlatforms,
		platformOptions,
		isLoading,
		includedSources,
	};
};
