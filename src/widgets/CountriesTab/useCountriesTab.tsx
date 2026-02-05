import {
	config,
	type Doi,
	getAlignedCountryName,
	getIncludedSources,
	getPercentage,
	roundPercentage,
} from '@/shared';
import { useMetricsByCountryOrRegion } from '@/shared/hooks/useMetricsByCountryOrRegion';

export const useCountriesTab = (doi: Doi) => {
	const {
		metaData,
		totalCount,
		selectedPlatforms,
		preProcessedData,
		platformOptions,
		isLoading,
		setSelectedPlatforms,
	} = useMetricsByCountryOrRegion({ doi, dataType: 'country' });

	let topTenCount = 0;

	const processedData = preProcessedData
		.slice(0, config.charts.countriesChart.countriesListLimit)
		.map(([country, totalMetrics], index) => {
			const percentage = getPercentage(totalMetrics, totalCount);

			topTenCount += totalMetrics;

			return {
				name: getAlignedCountryName(country),
				metrics: totalMetrics,
				percentage: percentage,
				fill: `var(--color-countries-${index + 1})`,
			};
		});

	const restCount = totalCount - topTenCount;

	if (restCount > 0) {
		processedData.push({
			name: 'Others',
			metrics: restCount,
			percentage: getPercentage(restCount, totalCount),
			fill: 'var(--color-countries-11)',
		});
	}

	const processedCsvData = processedData.map(({ name, percentage }) => [
		name,
		roundPercentage(percentage),
	]);

	const csvData: string[][] = [config.csv.countriesHeader, ...processedCsvData];

	const includedSources = getIncludedSources(
		selectedPlatforms,
		platformOptions,
	);

	return {
		metaData,
		metricsData: processedData,
		csvData,
		includedSources,
		selectPlatform: setSelectedPlatforms,
		selectedPlatforms,
		platformOptions,
		isLoading,
	};
};
