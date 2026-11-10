import type { WorkDto } from '@/shared/interfaces';
import { jsonResponse, stubFetch } from './fetch';

type Aggregation =
	| 'year,measure_uri'
	| 'country_uri,measure_uri'
	| 'measure_uri,month';

export type MetricsPayload = { book?: unknown[]; chapters?: unknown[] };

type Routes = {
	/** Thoth GraphQL responses, keyed by the `doi` variable sent in the query. */
	works: Record<string, WorkDto>;
	/** Normalized (bare) DOI of the main work, to tell book requests apart. */
	bookDoi: string;
	metrics: Partial<Record<Aggregation, MetricsPayload>>;
};

/**
 * Stubs `fetch` with a router: GraphQL requests resolve `workByDoi`, OPERAS
 * metrics requests resolve the payload registered for their aggregation. The
 * request carrying only the main work's DOI is the "book" request; every other
 * metrics request is a "chapters" request.
 */
export const routeFetch = ({ works, bookDoi, metrics }: Routes) =>
	stubFetch(async (...args: unknown[]) => {
		const [rawInput, init] = args as [string | URL, RequestInit | undefined];
		const input = String(rawInput);

		if (input.startsWith('https://thoth.test/graphql')) {
			const { variables } = JSON.parse(String(init?.body));

			return jsonResponse({ data: { workByDoi: works[variables.doi] } });
		}

		const url = new URL(input);
		const aggregation = url.searchParams.get('aggregation') as Aggregation;
		const filter = url.searchParams.get('filter') ?? '';
		const dois = (filter.split(',measure_uri:')[0] ?? '')
			.split(',work_uri:info:doi:')
			.map((doi) => doi.replace(/^work_uri:info:doi:/, ''));
		const isBookRequest = dois.length === 1 && dois[0] === bookDoi;
		const payload = metrics[aggregation] ?? {};

		return jsonResponse({
			data: (isBookRequest ? payload.book : payload.chapters) ?? [],
		});
	});

/** Fetch calls made to the OPERAS metrics API (everything but GraphQL). */
export const metricsRequests = (fetchMock: ReturnType<typeof stubFetch>) =>
	fetchMock.mock.calls
		.map(([url]) => String(url))
		.filter((url) => url.startsWith('https://metrics.test/'));
