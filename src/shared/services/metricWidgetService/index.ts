import { ClientError, GraphQLClient } from 'graphql-request';
import { config } from '../../config';
import type {
	MetricWidgetData,
	MetricWidgetInput,
} from '../../interfaces/MetricsData';
import { METRIC_WIDGET_QUERY } from './document';
import {
	errorFromGraphQLErrors,
	errorFromHttpStatus,
	type MetricWidgetError,
	MetricWidgetFailedError,
} from './errors';
import { validateMetricWidget } from './validation';

export * from './document';
export * from './errors';
export { pairKeyOf, validateMetricWidget } from './validation';

/**
 * Maps anything `graphql-request` throws to a widget error. The `ClientError` itself is dropped here: its message
 * embeds the response body and the request variables.
 */
const toMetricWidgetError = (error: unknown): MetricWidgetError => {
	if (error instanceof ClientError) {
		const errors = error.response?.errors as unknown;

		if (Array.isArray(errors) && errors.length > 0) {
			return errorFromGraphQLErrors(errors);
		}

		const status = error.response?.status ?? 0;

		// A 2xx reaches here only with a non-empty, non-array `errors` member: GraphQL errors of no known type.
		if (status >= 200 && status < 300) {
			return new MetricWidgetFailedError('UNKNOWN_ERROR_TYPE');
		}

		return errorFromHttpStatus(status);
	}

	// A rejected fetch (network failure, or a response the browser cannot read), or a 2xx body that is not
	// GraphQL JSON.
	return new MetricWidgetFailedError(
		error instanceof TypeError ? 'NETWORK_ERROR' : 'NOT_GRAPHQL',
		true,
	);
};

/**
 * Reads Thoth's public `metricWidget` query (register section 4.4) from `config.metaApi.url`. Anonymous: no
 * credential, no extra header, and `credentials: 'omit'` so no cookie is sent either.
 */
class MetricWidgetService {
	private client = new GraphQLClient(config.metaApi.url, {
		credentials: 'omit',
	});

	public async getMetricWidget(
		input: MetricWidgetInput,
	): Promise<MetricWidgetData> {
		let data: { metricWidget?: unknown } | null | undefined;

		try {
			data = await this.client.request<{ metricWidget?: unknown }>(
				METRIC_WIDGET_QUERY,
				{ input },
			);
		} catch (error) {
			throw toMetricWidgetError(error);
		}

		if (data?.metricWidget === undefined || data.metricWidget === null) {
			throw new MetricWidgetFailedError('NO_DATA');
		}

		return validateMetricWidget(data.metricWidget, input);
	}
}

export default MetricWidgetService;
