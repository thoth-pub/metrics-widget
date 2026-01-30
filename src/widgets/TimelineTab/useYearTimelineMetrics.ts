import {
	convertMonthToKey,
	type Doi,
	type FilterOption,
	getColor,
	getYearDateRange,
	type MetricsByMonthsSourceDto,
	updateSource,
} from '@/shared';
import { useMetricsByMonth } from '@/shared/hooks/useMetricsByMonth';

type UseYearTimelineMetricsProps = {
	doi: Doi;
	selectedYears: FilterOption[];
	selectedPlatforms: FilterOption[];
};

type ProcessedMonthData = {
	name: string;
	color: string;
	data: {
		month: string;
		book: number;
		chapters: number;
	}[];
};

type ProcessedMonthsData = ProcessedMonthData[];

type PreProcessedMonthsData = {
	[platform: string]: {
		color: string;
		months: {
			[month: string]: {
				book: number;
				chapters: number;
			};
		};
	};
};

export const useYearTimelineMetrics = (props: UseYearTimelineMetricsProps) => {
	const { doi, selectedYears, selectedPlatforms } = props;

	const startEndDateRange =
		selectedYears.length > 0
			? getYearDateRange(selectedYears[0].value)
			: getYearDateRange();

	const { metricsData, isLoading, error } = useMetricsByMonth({
		doi,
		...startEndDateRange,
	});

	const preProcessedMonthsData: PreProcessedMonthsData = {};

	const processMetricsData = (
		metrics: MetricsByMonthsSourceDto[],
		keyName: 'book' | 'chapters',
	) => {
		for (const metric of metrics) {
			const { data, source } = metric;

			data.forEach((platformMetric) => {
				const { month, value } = platformMetric;

				const key = updateSource(source);
				const monthKey = convertMonthToKey(month);

				const existingData = preProcessedMonthsData[key] ?? {
					color: getColor(source),
					months: {
						[monthKey]: {
							book: 0,
							chapters: 0,
						},
					},
				};

				if (!existingData.months[monthKey]) {
					existingData.months[monthKey] = {
						book: 0,
						chapters: 0,
					};
				}

				existingData.months[monthKey][keyName] += value;
				preProcessedMonthsData[key] = existingData;
			});
		}
	};

	processMetricsData(metricsData.bookMetrics, 'book');
	processMetricsData(metricsData.chaptersMetrics, 'chapters');

	const processedMonthsData: ProcessedMonthsData = Object.entries(
		preProcessedMonthsData,
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
			data: Object.entries(data.months).map(([month, data]) => {
				return {
					month: month,
					book: data.book ?? 0,
					chapters: data.chapters ?? 0,
				};
			}),
		};
	});

	const processMonthsCsvData = () => {
		const monthsKeys = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		const csvData: string[][] = [['Platform', ...monthsKeys]];

		for (const platform of Object.entries(preProcessedMonthsData)) {
			const [name, { months }] = platform;

			const isPlatformSelected =
				selectedPlatforms.some((platform) => platform.value === name) ||
				selectedPlatforms.length === 0;

			if (!isPlatformSelected) {
				continue;
			}

			const monthsData = new Array(monthsKeys.length).fill(0);

			Object.entries(months).forEach(([month, data]) => {
				const monthIndex = monthsKeys.indexOf(month);

				monthsData[monthIndex] = data.book + data.chapters;
			});

			csvData.push([name, ...monthsData]);
		}

		return csvData;
	};

	const csvData: string[][] = processMonthsCsvData();

	return {
		processedMonthsData,
		csvData,
		isLoading,
		error,
	};
};
