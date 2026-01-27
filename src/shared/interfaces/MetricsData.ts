export type MetricsByYearDto = {
	year: string;
	data: {
		measure_uri: string;
		namespace: string;
		source: string;
		type: string;
		version: string;
		value: number;
	}[];
};

export type MetricsByYearResponse = {
	bookMetrics: MetricsByYearDto[];
	chaptersMetrics: MetricsByYearDto[];
};
