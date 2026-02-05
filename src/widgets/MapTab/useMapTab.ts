import {
	config,
	type Doi,
	getApiCountryName,
	getChartColorByPercentage,
	getIncludedSources,
	getPercentage,
	roundPercentage,
	useMetricsByCountryOrRegion,
} from '@/shared';
import { useState } from 'react';

export const useMapTab = (doi: Doi) => {
	const {
		metaData,
		rawData,
		preProcessedData,
		totalCount,
		selectedPlatforms,
		isLoading,
		platformOptions,
		setSelectedPlatforms,
	} = useMetricsByCountryOrRegion({
		doi,
		dataType: 'country',
	});

	const [selectedCountry, setSelectedCountry] = useState<{
		name: string;
		percentage: string;
	} | null>(null);

	const processedData = preProcessedData.map(([country, value]) => {
		return {
			name: country,
			metrics: value,
			percentage: getPercentage(value, totalCount),
		};
	});

	const processedCsvData = processedData.map(({ name, percentage }) => [
		name,
		roundPercentage(percentage),
	]);

	const csvData: string[][] = [config.csv.countriesHeader, ...processedCsvData];

	const includedSources = getIncludedSources(
		selectedPlatforms,
		platformOptions,
	);

	const tooltipContent = selectedCountry
		? `${selectedCountry.name} ${selectedCountry.percentage}%`
		: '';

	const getCountryColor = (countryName: string) => {
		const topCountry = processedData[0];
		const country = processedData.find(
			(country) => country.name === countryName,
		);
		const countryValue = country?.percentage ?? 0;
		const topCountryValue = topCountry?.percentage ?? 0;

		return getChartColorByPercentage({
			highestValue: topCountryValue,
			lowestValue: countryValue,
		});
	};

	const updateContent = (countryName: string) => {
		const countryData = rawData[getApiCountryName(countryName)];

		if (!countryData) return;

		setSelectedCountry({
			name: countryName,
			percentage: roundPercentage(getPercentage(countryData, totalCount)),
		});
	};

	const resetContent = () => setSelectedCountry(null);

	return {
		metaData,
		metricsData: processedData,
		selectedCountry,
		csvData,
		selectedPlatforms,
		tooltipContent,
		isLoading,
		platformOptions,
		includedSources,
		selectPlatform: setSelectedPlatforms,
		updateContent,
		resetContent,
		getCountryColor,
	};
};
