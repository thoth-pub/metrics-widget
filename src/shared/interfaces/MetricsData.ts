type MeasureDto = {
	measure_uri: string;
	namespace: string;
	source: string;
	type: string;
	version: string;
	value: number;
};

export type MetricsByYearDto = {
	year: string;
	data: MeasureDto[];
};

export type MetricsByYearResponse = {
	bookMetrics: MetricsByYearDto[];
	chaptersMetrics: MetricsByYearDto[];
};

export type MetricsByCountryDto = {
	country_uri: string;
	country_code: string;
	country_name: string;
	continent_code: string;
	data: MeasureDto[];
};

export type MetricByCountryKey = keyof Pick<
	MetricsByCountryDto,
	'country_name' | 'continent_code'
>;

export type MetricsByCountryResponse = {
	bookMetrics: MetricsByCountryDto[];
	chaptersMetrics: MetricsByCountryDto[];
};
