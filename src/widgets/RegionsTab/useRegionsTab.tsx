import {
	continentValues,
	countriesTotal,
	type Doi,
	regionsCsv,
	sharePercentage,
} from '@/shared';
import { useGeography } from '../MetricTab/useGeography';

/** The combined distribution by UN M49 region. */
export const useRegionsTab = (doi: Doi) => {
	const geography = useGeography(doi);
	const { countries } = geography;
	const total = countriesTotal(countries);

	const metricsData = continentValues(countries).map(
		({ continent, value }, index) => ({
			name: continent,
			value,
			metrics: Number(value),
			percentage: sharePercentage(value, total),
			fill: `var(--mw-color-countries-${index + 1})`,
		}),
	);

	return {
		...geography,
		metricsData,
		csvData: regionsCsv(countries),
	};
};
