// Every failed metrics read becomes one of these errors. They carry a fixed message and a reason code only:
// never a response body, an error body, a `ClientError` message or a request variable.

export type MetricWidgetErrorReason =
	| 'METRIC_WIDGET_UNAVAILABLE'
	| 'METRIC_QUERY_LIMIT_EXCEEDED'
	| 'METRIC_QUERY_INVALID'
	| 'METRIC_WIDGET_BUSY'
	| 'INTERNAL_ERROR'
	| 'UNKNOWN_ERROR_TYPE'
	| 'NETWORK_ERROR'
	| 'HTTP_SERVER_ERROR'
	| 'HTTP_CLIENT_ERROR'
	| 'NOT_GRAPHQL'
	| 'NO_DATA'
	| 'INVALID_RESPONSE';

export abstract class MetricWidgetError extends Error {
	readonly reason: MetricWidgetErrorReason;

	constructor(reason: MetricWidgetErrorReason) {
		super(`The metrics read failed (${reason}).`);
		this.name = new.target.name;
		this.reason = reason;
	}
}

/** "Metrics are not available for this work": no retry button and no automatic retry. */
export class MetricWidgetUnavailableError extends MetricWidgetError {}

/** "Something went wrong" with a retry button; `autoRetry` allows one automatic retry. */
export class MetricWidgetFailedError extends MetricWidgetError {
	readonly autoRetry: boolean;

	constructor(reason: MetricWidgetErrorReason, autoRetry = false) {
		super(reason);
		this.autoRetry = autoRetry;
	}
}

const UNAVAILABLE_TYPES = new Set<string>([
	'METRIC_WIDGET_UNAVAILABLE',
	'METRIC_QUERY_LIMIT_EXCEEDED',
	'METRIC_QUERY_INVALID',
]);

/** The error a GraphQL `errors` array maps to, by `errors[0].extensions.type`, whatever the HTTP status. */
export const errorFromGraphQLErrors = (errors: unknown[]): MetricWidgetError => {
	const first = errors[0] as { extensions?: { type?: unknown } } | null;
	const type = first?.extensions?.type;

	if (typeof type === 'string' && UNAVAILABLE_TYPES.has(type)) {
		return new MetricWidgetUnavailableError(type as MetricWidgetErrorReason);
	}

	if (type === 'METRIC_WIDGET_BUSY') {
		return new MetricWidgetFailedError('METRIC_WIDGET_BUSY', true);
	}

	if (type === 'INTERNAL_ERROR') {
		return new MetricWidgetFailedError('INTERNAL_ERROR');
	}

	return new MetricWidgetFailedError('UNKNOWN_ERROR_TYPE');
};

/** The error an HTTP failure without a GraphQL body maps to. */
export const errorFromHttpStatus = (status: number): MetricWidgetError =>
	status >= 500
		? new MetricWidgetFailedError('HTTP_SERVER_ERROR', true)
		: new MetricWidgetFailedError('HTTP_CLIENT_ERROR');

/** TanStack Query `retry`: one automatic retry, only for the classes that allow it. */
export const shouldRetryMetricWidgetRead = (
	failureCount: number,
	error: unknown,
) =>
	failureCount < 1 && error instanceof MetricWidgetFailedError && error.autoRetry;

/** TanStack Query `retryDelay`: a random 2 to 4 seconds. */
export const metricWidgetRetryDelay = () => 2000 + Math.random() * 2000;
