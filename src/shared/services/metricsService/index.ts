import { config } from '@/shared';
import type {
	Doi,
	MetricsByCountryDto,
	MetricsByCountryResponse,
	MetricsByYearDto,
	MetricsByYearResponse,
} from '@/shared/interfaces';

type RequestProps = {
	workDoi: Doi;
	chaptersDoi: Doi[];
};

type AggregationType =
	| 'measure_uri,month'
	| 'country_uri,measure_uri'
	| 'year,measure_uri';

type MetricsPromisesGenerator = RequestProps & {
	aggregationType: AggregationType;
	startDate?: string;
	endDate?: string;
};

type MetricsByMonthRequestProps = RequestProps & {
	startDate: string;
};

class MetricsService {
	private apiLimit = config.metricsApi.itemsPerRequestLimit;

	private generateUrl(
		aggregationType: AggregationType,
		dois: Doi[],
		startDate?: string,
		endDate?: string,
	) {
		const baseQuery = `${config.metricsApi.url}/events?aggregation=${aggregationType}`;
		const startDateFilter =
			startDate && startDate.length > 0 ? `&start_date=${startDate}` : '';
		const endDateFilter =
			endDate && endDate.length > 0 ? `&end_date=${endDate}` : '';
		const trackedMetrics =
			config.metricsApi.trackedMetrics.join(',measure_uri:');
		const query = dois.join(`,work_uri:info:doi:`);

		return `${baseQuery}${startDateFilter}${endDateFilter}&filter=work_uri:info:doi:${query},measure_uri:${trackedMetrics}`;
	}

	private async generateMetricsPromises({
		workDoi,
		chaptersDoi,
		aggregationType,
	}: MetricsPromisesGenerator) {
		if (workDoi.length === 0) return [];

		const promises = [];

		let offset = 0;
		const bookUrl = this.generateUrl(aggregationType, [workDoi]);
		promises.push(fetch(bookUrl));

		do {
			const worksDois = chaptersDoi.slice(offset, offset + this.apiLimit);

			const url = this.generateUrl(aggregationType, worksDois);

			promises.push(fetch(url));

			offset += config.metricsApi.itemsPerRequestLimit;
		} while (offset < chaptersDoi.length);

		return promises;
	}

	private async parseMetricsResponse<T>(
		responses: PromiseSettledResult<Response>[],
	) {
		const data: { bookMetrics: T[]; chaptersMetrics: T[] } = {
			bookMetrics: [],
			chaptersMetrics: [],
		};
		let index = 0;

		for (const response of responses) {
			if (response.status === 'rejected') {
				index++;
				continue;
			}

			const body: { data: T[] } = await response.value.json();

			if (index === 0) {
				data.bookMetrics = body.data;
				index++;
				continue;
			}

			data.chaptersMetrics.push(...body.data);
			index++;
		}

		return data;
	}

	public async getMetricsByYear({
		workDoi,
		chaptersDoi,
	}: RequestProps): Promise<MetricsByYearResponse> {
		const promises = await this.generateMetricsPromises({
			workDoi,
			chaptersDoi,
			aggregationType: 'year,measure_uri',
		});

		const responses = await Promise.allSettled(promises);

		const data = await this.parseMetricsResponse<MetricsByYearDto>(responses);

		return data;
	}

	public async getMetricsByCountry({
		workDoi,
		chaptersDoi,
	}: RequestProps): Promise<MetricsByCountryResponse> {
		const promises = await this.generateMetricsPromises({
			workDoi,
			chaptersDoi,
			aggregationType: 'country_uri,measure_uri',
		});

		const responses = await Promise.allSettled(promises);

		const data =
			await this.parseMetricsResponse<MetricsByCountryDto>(responses);

		return data;
	}

	public async getMetricsByMonth({
		workDoi,
		chaptersDoi,
		startDate,
	}: MetricsByMonthRequestProps): Promise<unknown> {
		const promises = await this.generateMetricsPromises({
			workDoi,
			chaptersDoi,
			aggregationType: 'measure_uri,month',
			startDate,
		});

		const responses = await Promise.allSettled(promises);

		const data = await this.parseMetricsResponse<unknown>(responses);

		return data;
	}
}

export default MetricsService;
