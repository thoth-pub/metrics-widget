import {
	config,
	countriesCsv,
	countriesTotal,
	type Doi,
	sharePercentage,
} from '@/shared';
import { useGeography } from '../MetricTab/useGeography';

/** The top countries of the combined distribution, then `Others` for the rest. */
export const useCountriesTab = (doi: Doi) => {
	const geography = useGeography(doi);
	const { countries } = geography;
	const total = countriesTotal(countries);
	const limit = config.charts.countriesChart.countriesListLimit;

	const top = countries.slice(0, limit).map((country, index) => ({
		name: country.countryName,
		value: country.value,
		metrics: Number(country.value),
		percentage: sharePercentage(country.value, total),
		fill: `var(--mw-color-countries-${index + 1})`,
	}));

	const rest = countries
		.slice(limit)
		.reduce((sum, { value }) => sum + BigInt(value), BigInt(0));

	if (countries.length > limit) {
		top.push({
			name: 'Others',
			value: rest.toString(),
			metrics: Number(rest),
			percentage: sharePercentage(rest.toString(), total),
			fill: 'var(--mw-color-countries-11)',
		});
	}

	return {
		...geography,
		metricsData: top,
		csvData: countriesCsv(countries),
	};
};
