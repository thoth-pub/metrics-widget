import { describe, expect, it, vi } from 'vitest';
import type { MetricWidgetInput } from '@/shared/interfaces';
import MetricWidgetService, {
	METRIC_WIDGET_QUERY,
	MetricWidgetFailedError,
	MetricWidgetUnavailableError,
} from '@/shared/services/metricWidgetService';
import {
	bucket,
	country,
	E,
	graphqlData,
	graphqlError,
	OAPEN_DOWNLOADS,
	PLATFORMS,
	response,
	SERVED_START,
	section,
	total,
	YEAR_RANGES,
	yearResponse,
} from '../fixtures/metricWidget';
import { jsonResponse, stubFetch } from '../helpers/fetch';

const YEAR_INPUT: MetricWidgetInput = {
	doi: '10.11647/test.0001',
	endDate: E,
	timelineGrain: 'YEAR',
};

const read = (input: MetricWidgetInput = YEAR_INPUT) =>
	new MetricWidgetService().getMetricWidget(input);

const failure = async (input: MetricWidgetInput = YEAR_INPUT) => {
	try {
		await read(input);
	} catch (error) {
		return error;
	}

	throw new Error('the read did not fail');
};

describe('MetricWidgetService request', () => {
	it('POSTs one MetricWidget operation to VITE_THOTH_API_URL with only the input variable', async () => {
		const fetchMock = stubFetch(async () => graphqlData(yearResponse()));

		await read();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];

		expect(String(url)).toBe('https://thoth.test/graphql');
		expect(init.method).toBe('POST');
		expect(JSON.parse(String(init.body))).toEqual({
			operationName: 'MetricWidget',
			query: METRIC_WIDGET_QUERY,
			variables: { input: YEAR_INPUT },
		});
	});

	it('sends no credential: credentials omitted and no Authorization or cookie header', async () => {
		const fetchMock = stubFetch(async () => graphqlData(yearResponse()));

		await read();

		const init = fetchMock.mock.calls[0][1] as RequestInit;
		const headers = new Headers(init.headers);

		expect(init.credentials).toBe('omit');
		expect(headers.has('authorization')).toBe(false);
		expect(headers.has('cookie')).toBe(false);
		expect([...headers.keys()].sort()).toEqual(['accept', 'content-type']);
	});

	it('sends a MONTH read with the bucket dates and returns the validated response', async () => {
		const monthInput: MetricWidgetInput = {
			doi: '10.11647/test.0001',
			startDate: '2026-01-01',
			endDate: E,
			timelineGrain: 'MONTH',
		};
		const fetchMock = stubFetch(async () =>
			graphqlData(response({ startDate: '2026-01-01' })),
		);

		const data = await read(monthInput);

		expect(
			JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))
				.variables,
		).toEqual({ input: monthInput });
		expect(data.startDate).toBe('2026-01-01');
	});
});

describe('MetricWidgetService error mapping', () => {
	it.each([
		['METRIC_WIDGET_UNAVAILABLE'],
		['METRIC_QUERY_LIMIT_EXCEEDED'],
		['METRIC_QUERY_INVALID'],
	])('%s is "not available" with no retry', async (type) => {
		stubFetch(async () => graphqlError(type));

		const error = await failure();

		expect(error).toBeInstanceOf(MetricWidgetUnavailableError);
		expect(error).toMatchObject({ reason: type });
	});

	it('METRIC_WIDGET_BUSY is a failure with one automatic retry', async () => {
		stubFetch(async () => graphqlError('METRIC_WIDGET_BUSY'));

		expect(await failure()).toMatchObject({
			reason: 'METRIC_WIDGET_BUSY',
			autoRetry: true,
		});
	});

	it.each([
		['INTERNAL_ERROR', 'INTERNAL_ERROR'],
		['SOMETHING_NEW', 'UNKNOWN_ERROR_TYPE'],
		[undefined, 'UNKNOWN_ERROR_TYPE'],
	])('GraphQL errors of type %s are a failure without automatic retry', async (type, reason) => {
		stubFetch(async () => graphqlError(type));

		const error = await failure();

		expect(error).toBeInstanceOf(MetricWidgetFailedError);
		expect(error).toMatchObject({ reason, autoRetry: false });
	});

	it('classifies by the GraphQL body, not the status: HTTP 500 with METRIC_WIDGET_UNAVAILABLE', async () => {
		stubFetch(async () => graphqlError('METRIC_WIDGET_UNAVAILABLE', 500));

		expect(await failure()).toBeInstanceOf(MetricWidgetUnavailableError);
	});

	it('HTTP 400 with GraphQL errors and no type (a server without metricWidget) has no automatic retry', async () => {
		stubFetch(async () =>
			jsonResponse(
				{ errors: [{ message: 'Unknown field "metricWidget"' }] },
				400,
			),
		);

		expect(await failure()).toMatchObject({
			reason: 'UNKNOWN_ERROR_TYPE',
			autoRetry: false,
		});
	});

	it.each([
		[403],
		[429],
	])('HTTP %i without a GraphQL body has no automatic retry', async (status) => {
		stubFetch(async () => new Response('Forbidden', { status }));

		expect(await failure()).toMatchObject({
			reason: 'HTTP_CLIENT_ERROR',
			autoRetry: false,
		});
	});

	it('HTTP 502 with an HTML body is a failure with one automatic retry', async () => {
		stubFetch(
			async () =>
				new Response('<html>Bad gateway</html>', {
					status: 502,
					headers: { 'content-type': 'text/html' },
				}),
		);

		expect(await failure()).toMatchObject({
			reason: 'HTTP_SERVER_ERROR',
			autoRetry: true,
		});
	});

	it('a rejected fetch is a network failure with one automatic retry', async () => {
		stubFetch(async () => {
			throw new TypeError('Failed to fetch');
		});

		expect(await failure()).toMatchObject({
			reason: 'NETWORK_ERROR',
			autoRetry: true,
		});
	});

	it('a 2xx body that is not JSON is a failure with one automatic retry', async () => {
		stubFetch(
			async () =>
				new Response('<html>maintenance</html>', {
					status: 200,
					headers: { 'content-type': 'text/html' },
				}),
		);

		expect(await failure()).toMatchObject({
			reason: 'NOT_GRAPHQL',
			autoRetry: true,
		});
	});

	it('a 2xx GraphQL body with neither errors nor data.metricWidget has no automatic retry', async () => {
		stubFetch(async () => jsonResponse({ data: {} }));

		expect(await failure()).toMatchObject({
			reason: 'NO_DATA',
			autoRetry: false,
		});
	});

	it('never keeps the response body, the error body or the variables in the error', async () => {
		stubFetch(async () =>
			jsonResponse(
				{
					data: null,
					errors: [
						{
							message: 'SECRET-BODY-TEXT',
							extensions: { type: 'INTERNAL_ERROR' },
						},
					],
				},
				500,
			),
		);

		const error = (await failure()) as Error;
		const serialized = `${error.message} ${error.stack ?? ''} ${JSON.stringify(error)} ${String(error.cause ?? '')}`;

		expect(serialized).not.toContain('SECRET-BODY-TEXT');
		expect(serialized).not.toContain('10.11647/test.0001');
		expect(error.cause).toBeUndefined();
	});
});

describe('MetricWidgetService validation (fails closed)', () => {
	const validWith = (
		patch: (data: ReturnType<typeof yearResponse>) => void,
	) => {
		const data = yearResponse();

		patch(data);

		return data;
	};

	it('accepts the fixture and fills nothing in: a missing expected bucket stays missing here', async () => {
		const data = yearResponse();

		data.work.timeline = data.work.timeline.filter(
			({ startDate }) => startDate !== '2021-01-01',
		);
		stubFetch(async () => graphqlData(data));

		await expect(read()).resolves.toMatchObject({ startDate: SERVED_START });
	});

	it.each<[string, (data: ReturnType<typeof yearResponse>) => void]>([
		[
			'a value with a leading zero',
			(d) => {
				d.work.totals[0].value = '01';
			},
		],
		[
			'a negative zero',
			(d) => {
				d.work.totals[0].value = '-0';
			},
		],
		[
			'a decimal value',
			(d) => {
				d.work.timeline[0].value = '1.0';
			},
		],
		[
			'a number instead of a string',
			(d) => {
				d.work.totals[0].value = 5 as unknown as string;
			},
		],
		[
			'a null country value',
			(d) => {
				d.work.countries[0].value = null as unknown as string;
			},
		],
		[
			'a timeline pair missing from totals',
			(d) =>
				d.chapters?.timeline.push(
					bucket(
						{
							platformId: PLATFORMS.obp.platformId,
							measureId: OAPEN_DOWNLOADS.measureId,
						},
						YEAR_RANGES[0].startDate,
						YEAR_RANGES[0].endDate,
						'1',
					),
				),
		],
		[
			'a country pair missing from totals',
			(d) =>
				d.chapters?.countries.push(
					country(
						{
							platformId: PLATFORMS.zenodo.platformId,
							measureId: OAPEN_DOWNLOADS.measureId,
						},
						'FR',
						'1',
					),
				),
		],
		[
			'a repeated totals row',
			(d) => d.work.totals.push(total(OAPEN_DOWNLOADS, '1')),
		],
		[
			'a repeated country row',
			(d) => d.work.countries.push(country(OAPEN_DOWNLOADS, 'GB', '1')),
		],
		[
			'a lower-case country code',
			(d) => {
				d.work.countries[0].countryCode = 'gb';
			},
		],
		[
			'a three-letter country code',
			(d) => {
				d.work.countries[0].countryCode = 'GBR';
			},
		],
		[
			'an unexpected bucket',
			(d) =>
				d.work.timeline.push(
					bucket(OAPEN_DOWNLOADS, '2019-03-01', '2019-04-01', '1'),
				),
		],
		[
			'a repeated bucket',
			(d) => d.work.timeline.push({ ...d.work.timeline[0] }),
		],
		[
			'an unknown platform ID',
			(d) => {
				d.platforms = d.platforms.slice(1);
			},
		],
		[
			'an unknown measure ID',
			(d) => {
				d.measures = d.measures.slice(1);
			},
		],
		[
			'a mismatched endDate',
			(d) => {
				d.endDate = '2027-01-01';
			},
		],
		[
			'an R-YEAR startDate that is not a first of a month',
			(d) => {
				d.startDate = '2019-03-02';
			},
		],
		[
			'an R-YEAR startDate before 2000-01-01',
			(d) => {
				d.startDate = '1999-12-01';
			},
		],
		[
			'a missing work section',
			(d) => {
				d.work = undefined as unknown as typeof d.work;
			},
		],
		[
			'a negative excludedChildCount',
			(d) => {
				d.excludedChildCount = -1;
			},
		],
	])('fails on %s', async (_name, patch) => {
		stubFetch(async () => graphqlData(validWith(patch)));

		expect(await failure()).toMatchObject({
			reason: 'INVALID_RESPONSE',
			autoRetry: false,
		});
	});

	it('fails a MONTH read whose startDate is not the requested one', async () => {
		stubFetch(async () => graphqlData(response({ startDate: '2026-02-01' })));

		expect(
			await failure({
				doi: '10.11647/test.0001',
				startDate: '2026-01-01',
				endDate: E,
				timelineGrain: 'MONTH',
			}),
		).toMatchObject({ reason: 'INVALID_RESPONSE' });
	});

	it('accepts a value above 2^53 and keeps it exact', async () => {
		const data = response({
			work: section({ totals: [total(OAPEN_DOWNLOADS, '9007199254740993')] }),
		});

		stubFetch(async () => graphqlData(data));

		expect((await read()).work.totals[0].value).toBe('9007199254740993');
	});
});

describe('console silence', () => {
	it.each<[string, () => Response]>([
		['GraphQL error', () => graphqlError('INTERNAL_ERROR', 500)],
		[
			'HTML 502',
			() => new Response('<html>SECRET-BODY-TEXT</html>', { status: 502 }),
		],
		['not JSON', () => new Response('SECRET-BODY-TEXT', { status: 200 })],
		['invalid', () => graphqlData({ work: 'SECRET-BODY-TEXT' })],
	])('writes nothing to the console on a %s', async (_name, answer) => {
		const spies = [
			vi.spyOn(console, 'error'),
			vi.spyOn(console, 'warn'),
			vi.spyOn(console, 'log'),
		];

		stubFetch(async () => answer());
		await failure();

		for (const spy of spies) expect(spy).not.toHaveBeenCalled();
	});
});
