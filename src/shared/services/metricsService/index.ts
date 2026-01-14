import { config } from '@/shared';
import type { Doi } from '@/shared/interfaces';

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
		const query = dois.join(`,work_uri:info:doi:`);

		return `${baseQuery}${startDateFilter}${endDateFilter}&filter=work_uri:info:doi:${query}`;
	}

	public async getMetricsByYear(dois: Doi[]): Promise<unknown> {
		if (dois.length === 0) return [];

		let offset = 0;
		const promises = [];

		do {
			const worksDois = dois.slice(offset, offset + this.apiLimit);

			const url = this.generateUrl('year,measure_uri', worksDois);

			promises.push(fetch(url));

			offset += config.metricsApi.itemsPerRequestLimit;
		} while (offset < dois.length);

		const responses = await Promise.allSettled(promises);

		const data: unknown[] = [];

		for (const response of responses) {
      if (response.status === 'rejected') continue;

			const body = await response.value.json();

			data.push(body);
		}

		return data;
	}
}

export default MetricsService;
