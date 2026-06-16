import {
	type FilterOption,
	getColor,
	type MetricsByYearDto,
	type MetricsByYearResponse,
	updateSource,
	useTheme,
} from '@/shared';

type ProcessedYearData = {
	name: string;
	color: string;
	data: {
		year: string;
		book: number;
		chapters: number;
		source: string;
	}[];
};

type ProcessedYearsData = ProcessedYearData[];

type PreProcessedYearsData = {
	[platform: string]: {
		color: string;
		years: {
			[year: string]: {
				book: number;
				chapters: number;
			};
		};
	};
};

type UseYearsTimelineMetricsProps = {
	selectedPlatforms: FilterOption[];
	selectedYears: FilterOption[];
	metricsDataByYear: MetricsByYearResponse;
};

export const useYearsTimelineMetrics = (
	props: UseYearsTimelineMetricsProps,
) => {
	const { selectedPlatforms, selectedYears, metricsDataByYear } = props;
	const theme = useTheme();

	const platforms = new Set<string>();
	const preProcessedYearsData: PreProcessedYearsData = {};

	const processMetricsData = (
		metrics: MetricsByYearDto[],
		keyName: 'book' | 'chapters',
	) => {
		for (const metric of metrics) {
			const { year, data } = metric;

			const isYearSelected = selectedYears.some(({ value }) => value === year);

			if (!isYearSelected) continue;

			data.forEach((platformMetric) => {
				const { source, value } = platformMetric;

				const key = updateSource(source);
				platforms.add(source);

				const existingData = preProcessedYearsData[key] ?? {
					color: getColor(source, theme),
					years: {},
				};

				if (!existingData.years[year]) {
					existingData.years[year] = {
						book: 0,
						chapters: 0,
					};
				}

				existingData.years[year][keyName] += value;
				preProcessedYearsData[key] = existingData;
			});
		}
	};

	processMetricsData(metricsDataByYear.bookMetrics, 'book');
	processMetricsData(metricsDataByYear.chaptersMetrics, 'chapters');

	const platformOptions: FilterOption[] = Array.from(platforms).map(
		(platform) => ({
			label: updateSource(platform),
			value: updateSource(platform),
		}),
	);

	const processedYearsData: ProcessedYearsData = Object.entries(
		preProcessedYearsData,
	).map(([source, data]) => {
		const isPlatformSelected =
			selectedPlatforms.some((platform) => platform.value === source) ||
			selectedPlatforms.length === 0;

		if (selectedPlatforms.length > 0 && !isPlatformSelected) {
			return {
				name: source,
				color: data.color,
				data: [],
			};
		}

		return {
			name: source,
			color: data.color,
			data: Object.entries(data.years).map(([year, data]) => {
				return {
					year: year,
					book: data.book ?? 0,
					chapters: data.chapters ?? 0,
					source: source,
				};
			}),
		};
	});

	const processYearsCsvData = () => {
		const csvData: string[][] = [
			['Platform', ...selectedYears.map(({ label }) => label)],
		];

		for (const platform of Object.entries(preProcessedYearsData)) {
			const [name, { years }] = platform;

			const isPlatformSelected =
				selectedPlatforms.some((platform) => platform.value === name) ||
				selectedPlatforms.length === 0;

			if (!isPlatformSelected) {
				continue;
			}

			const platformData = [name];

			selectedYears.forEach(({ value }) => {
				const yearData = years[value] ?? { book: 0, chapters: 0 };

				platformData.push((yearData.book + yearData.chapters).toString());
			});

			csvData.push(platformData);
		}

		return csvData;
	};

	const csvData: string[][] = processYearsCsvData();

	return {
		processedYearsData,
		platformOptions,
		csvData,
	};
};
