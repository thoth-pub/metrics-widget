import {
  config,
  type Doi,
  type MetricsByYearDto,
  useMetricsByYear,
  useTheme,
} from '@/shared';
import { getColor, isChapter, updateSource } from '@/shared/utils';

export type Measure = {
	source: string;
	name: string;
	Book: number;
	Chapters: number;
	fill: string;
	stroke: string;
};

type Measures = {
	[platform: string]: Measure;
};

export const useMeasuresTab = (doi: Doi) => {
	const { metaData, metricsData, isLoading } = useMetricsByYear(doi);
	const theme = useTheme();

	const measures: Measures = {};
	const strokes: Record<string, string> = {};

	const formatMetricsData = (
		metrics: MetricsByYearDto['data'],
		keyName: 'Book' | 'Chapters',
	) => {
		for (const metric of metrics) {
			const { source, type, value } = metric;
			const key = `${updateSource(source)} ${type}`;
			const color = getColor(source, theme);
			const strokeId = `stripe-${color}`;

			strokes[strokeId] = color;

			const existingData = measures[key] ?? {
				source: source,
				name: key,
				Book: 0,
				Chapters: 0,
				fill: color,
				stroke: strokeId,
			};

			existingData[keyName] += value;
			measures[key] = existingData;
		}

		return measures;
	};

	for (const metric of metricsData.bookMetrics) {
		const metrics = metric.data;

		formatMetricsData(metrics, 'Book');
	}

	for (const metric of metricsData.chaptersMetrics) {
		const metrics = metric.data;

		formatMetricsData(metrics, 'Chapters');
	}

	const isMainWorkChapter = isChapter(metaData.book.type);

	const csvData: string[][] = [config.csv.measuresHeader];

  const includedSources = Object.keys(measures);

	for (const measure of Object.values(measures)) {
		const { Book, Chapters } = measure;

		csvData.push([
			measure.source,
			isMainWorkChapter ? '0' : Book.toString(),
			isMainWorkChapter ? `${Book + Chapters}` : Chapters.toString(),
		]);
	}

	return {
		metaData,
		measures,
		strokes,
		csvData,
		isLoading,
		includedSources,
	};
};
