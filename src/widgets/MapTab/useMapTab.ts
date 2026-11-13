import { useState } from 'react';
import {
	config,
	countriesCsv,
	countriesTotal,
	countryCodeOf,
	countryName,
	type Doi,
	getChartColorByPercentage,
	NO_DATA_LABEL,
	roundPercentage,
	sharePercentage,
	useTheme,
} from '@/shared';
import { useGeography } from '../MetricTab/useGeography';

const separator = config.charts.timeMetricsChartLabelSeparator;

/**
 * The combined distribution on the world map. Map features are matched to countries by code (through the
 * dashboard's name-to-code table), never by name.
 */
export const useMapTab = (doi: Doi) => {
	const geography = useGeography(doi);
	const { countries } = geography;
	const theme = useTheme();
	const total = countriesTotal(countries);

	const shares = new Map(
		countries.map(({ countryCode, value }) => [
			countryCode,
			sharePercentage(value, total),
		]),
	);
	const topShare = Math.max(0, ...shares.values());

	const [tooltipContent, setTooltipContent] = useState('');

	const getCountryColor = (featureName: string) => {
		const code = countryCodeOf(featureName);
		const share = (code && shares.get(code)) || 0;

		return getChartColorByPercentage({
			highestValue: topShare,
			lowestValue: share,
			theme,
		});
	};

	/** `<Country> · <share>%`, or `<Country> · no data` for a country without a value (never 0%). */
	const updateContent = (featureName: string) => {
		const code = countryCodeOf(featureName);
		const name = code ? countryName(code) : featureName;
		const share = code ? shares.get(code) : undefined;

		setTooltipContent(
			`${name}${separator}${share === undefined ? NO_DATA_LABEL : `${roundPercentage(share)}%`}`,
		);
	};

	const resetContent = () => setTooltipContent('');

	return {
		...geography,
		csvData: countriesCsv(countries),
		tooltipContent,
		updateContent,
		resetContent,
		getCountryColor,
	};
};
