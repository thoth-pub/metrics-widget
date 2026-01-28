import { config } from '@/shared';
import type {
	Doi,
	MetricsByCountryDto,
	MetricsByCountryResponse,
	MetricsByYearDto,
	MetricsByYearResponse,
} from '@/shared/interfaces';

class MetricsService {
	private apiLimit = config.metricsApi.itemsPerRequestLimit;

	private generateUrl(
		aggregationType:
			| 'measure_uri,month'
			| 'country_uri,measure_uri'
			| 'year,measure_uri',
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

	public async getMetricsByYear({
		workDoi,
		chaptersDoi,
	}: {
		workDoi: Doi;
		chaptersDoi: Doi[];
	}): Promise<MetricsByYearResponse> {
		if (workDoi.length === 0) return { bookMetrics: [], chaptersMetrics: [] };

		let offset = 0;
		const promises = [];
		const measuresType = 'year,measure_uri';

		const bookUrl = this.generateUrl(measuresType, [workDoi]);
		promises.push(fetch(bookUrl));

		do {
			const worksDois = chaptersDoi.slice(offset, offset + this.apiLimit);

			const url = this.generateUrl(measuresType, worksDois);

			promises.push(fetch(url));

			offset += config.metricsApi.itemsPerRequestLimit;
		} while (offset < chaptersDoi.length);

		const responses = await Promise.allSettled(promises);

		const data: MetricsByYearResponse = {
			bookMetrics: [],
			chaptersMetrics: [],
		};
		let index = 0;

		for (const response of responses) {
			if (response.status === 'rejected') {
				index++;
				continue;
			}

			const body: { data: MetricsByYearDto[] } = await response.value.json();

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

	public async getMetricsByCountry({
		workDoi,
		chaptersDoi,
	}: {
		workDoi: Doi;
		chaptersDoi: Doi[];
	}): Promise<MetricsByCountryResponse> {
		if (workDoi.length === 0) return { bookMetrics: [], chaptersMetrics: [] };

		let offset = 0;
		const promises = [];
		const measuresType = 'country_uri,measure_uri';

		const bookUrl = this.generateUrl('country_uri,measure_uri', [workDoi]);
		promises.push(fetch(bookUrl));

		do {
			const worksDois = chaptersDoi.slice(offset, offset + this.apiLimit);

			const url = this.generateUrl(measuresType, worksDois);

			promises.push(fetch(url));

			offset += config.metricsApi.itemsPerRequestLimit;
		} while (offset < chaptersDoi.length);

		const responses = await Promise.allSettled(promises);

		const data: MetricsByCountryResponse = {
			bookMetrics: [],
			chaptersMetrics: [],
		};
		let index = 0;

		for (const response of responses) {
			if (response.status === 'rejected') {
				index++;
				continue;
			}

			const body: { data: MetricsByCountryDto[] } = await response.value.json();

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
}

export default MetricsService;
