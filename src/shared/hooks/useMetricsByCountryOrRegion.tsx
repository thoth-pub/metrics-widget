import { useState } from 'react';
import type { Doi, FilterOption, MetricByCountryKey } from '../interfaces';
import { updateSource } from '../utils';
import { useMetricsByCountries } from './useMetricsByCountries';

type UseMetricsByCountryOrRegionProps = {
	doi: Doi;
	dataType: 'country' | 'continent';
};

export const useMetricsByCountryOrRegion = (
	props: UseMetricsByCountryOrRegionProps,
) => {
	const { doi, dataType } = props;

	const dataKey: MetricByCountryKey =
		dataType === 'country' ? 'country_name' : 'continent_code';

	const { metaData, metricsData, isLoading } = useMetricsByCountries(doi);
	const [selectedPlatforms, setSelectedPlatforms] = useState<FilterOption[]>(
		[],
	);

	const data = [...metricsData.bookMetrics, ...metricsData.chaptersMetrics];

	const availablePlatforms = new Set<string>();
	const allPlatforms = new Set<string>();

	for (const metric of data) {
		const { country_name, data: metrics } = metric;

		metrics.forEach((m) => {
			allPlatforms.add(m.source);

			if (!country_name) return;

			availablePlatforms.add(m.source);
		});
	}

	const preProcessedData: Record<string, number> = {};

	for (const metric of data) {
		const { country_name, data: metrics } = metric;

		if (!country_name) continue;

		const totalMetrics = metrics.reduce((acc, curr) => {
			const isPlatformSelected = selectedPlatforms.some(
				(platform) => platform.value === curr.source,
			);

			if (selectedPlatforms.length === 0 || isPlatformSelected) {
				return acc + curr.value;
			}

			return acc;
		}, 0);

		preProcessedData[metric[dataKey]] =
			(preProcessedData[metric[dataKey]] || 0) + totalMetrics;
	}

	const sortedPreProcessedData = Object.entries(preProcessedData).sort(
		(a, b) => b[1] - a[1],
	);

	const totalCount = Object.values(preProcessedData).reduce(
		(acc, curr) => acc + curr,
		0,
	);

	const disabledPlatforms = Array.from(allPlatforms).filter(
		(platform) => !availablePlatforms.has(platform),
	);

	const platformOptions = Array.from(allPlatforms).map((platform) => {
		const initialValue: FilterOption = {
			label: updateSource(platform),
			value: platform,
		};

		const isDisabled = disabledPlatforms.includes(platform);

		if (isDisabled) {
			initialValue.disabled = true;
			initialValue.disabledReason = 'Platform does not track data per country';
		}

		return initialValue;
	});

	return {
		metaData,
		isLoading,
		totalCount,
		rawData: preProcessedData,
		preProcessedData: sortedPreProcessedData,
		platformOptions,
		selectedPlatforms,
		setSelectedPlatforms,
	};
};
