import type { MetricWidgetInput, WorkDto } from '@/shared/interfaces';
import type { MetricWidgetHandler } from '../fixtures/metricWidget';
import { jsonResponse, stubFetch } from './fetch';

export const THOTH_URL = 'https://thoth.test/graphql';

type Routes = {
	/** `workByDoi` responses, keyed by the `doi` variable sent in the metadata query. */
	works: Record<string, WorkDto>;
	/** Answers each `metricWidget` request from its `input` variable. */
	metricWidget: MetricWidgetHandler;
};

type FetchMock = ReturnType<typeof stubFetch>;

/**
 * Stubs `fetch` with a router for the Thoth GraphQL endpoint: the metadata query resolves `workByDoi`, the
 * `MetricWidget` query is answered by the handler. A request to any other host is answered with a 599 and shows
 * up in `otherHostRequests`.
 */
export const routeFetch = ({ works, metricWidget }: Routes) =>
	stubFetch(async (...args: unknown[]) => {
		const [rawInput, init] = args as [string | URL, RequestInit | undefined];

		if (String(rawInput) !== THOTH_URL) {
			return new Response('unexpected host', { status: 599 });
		}

		const body = JSON.parse(String(init?.body));

		if (body.operationName === 'MetricWidget') {
			return metricWidget(body.variables.input);
		}

		return jsonResponse({ data: { workByDoi: works[body.variables.doi] } });
	});

const requestBodies = (fetchMock: FetchMock) =>
	fetchMock.mock.calls
		.filter(([url]) => String(url) === THOTH_URL)
		.map(([, init]) => JSON.parse(String((init as RequestInit).body)));

/** The `input` variable of every `metricWidget` request, in order. */
export const metricWidgetInputs = (fetchMock: FetchMock): MetricWidgetInput[] =>
	requestBodies(fetchMock)
		.filter((body) => body.operationName === 'MetricWidget')
		.map((body) => body.variables.input);

export const metadataRequests = (fetchMock: FetchMock) =>
	requestBodies(fetchMock).filter(
		(body) => body.operationName === 'GetWorkWithChapters',
	);

export const yearInputs = (fetchMock: FetchMock) =>
	metricWidgetInputs(fetchMock).filter(
		({ timelineGrain }) => timelineGrain === 'YEAR',
	);

export const monthInputs = (fetchMock: FetchMock) =>
	metricWidgetInputs(fetchMock).filter(
		({ timelineGrain }) => timelineGrain === 'MONTH',
	);

export const otherHostRequests = (fetchMock: FetchMock) =>
	fetchMock.mock.calls
		.map(([url]) => String(url))
		.filter((url) => url !== THOTH_URL);
