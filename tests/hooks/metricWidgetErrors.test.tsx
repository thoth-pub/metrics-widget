import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '@/App';
import {
	E,
	graphqlData,
	graphqlError,
	NOW,
	OAPEN_DOWNLOADS,
	total,
	yearResponse,
} from '../fixtures/metricWidget';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { jsonResponse } from '../helpers/fetch';
import { routeFetch, yearInputs } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

// The real map package cannot load under Node 22.14 (CI); see the stub.
vi.mock('react-simple-maps', () => import('../helpers/reactSimpleMapsStub'));

const NOT_AVAILABLE = 'Metrics are not available for this work';
const FAILED = 'Something went wrong';

/** Text that only a response body carries; it must never reach the console. */
const BODY_MARKER = 'BODY-MARKER-7f3a';

const html = (status: number) =>
	new Response(`<html>${BODY_MARKER}</html>`, {
		status,
		headers: { 'content-type': 'text/html' },
	});

/** A response that fails validation: a non-canonical value. */
const invalidResponse = () => {
	const data = yearResponse();

	data.work.totals[0] = total(OAPEN_DOWNLOADS, '0120');
	data.platforms[0] = { ...data.platforms[0], displayName: BODY_MARKER };

	return graphqlData(data);
};

/** Spec section 7.4, one case per row: the R-YEAR answer, the calls it costs and the screen it shows. */
const ROWS: [string, () => Response | Promise<Response>, number, string][] = [
	[
		'METRIC_WIDGET_UNAVAILABLE',
		() => graphqlError('METRIC_WIDGET_UNAVAILABLE'),
		1,
		NOT_AVAILABLE,
	],
	[
		'METRIC_QUERY_LIMIT_EXCEEDED',
		() => graphqlError('METRIC_QUERY_LIMIT_EXCEEDED'),
		1,
		NOT_AVAILABLE,
	],
	[
		'METRIC_QUERY_INVALID',
		() => graphqlError('METRIC_QUERY_INVALID'),
		1,
		NOT_AVAILABLE,
	],
	[
		'HTTP 500 with a METRIC_WIDGET_UNAVAILABLE body',
		() => graphqlError('METRIC_WIDGET_UNAVAILABLE', 500),
		1,
		NOT_AVAILABLE,
	],
	['METRIC_WIDGET_BUSY', () => graphqlError('METRIC_WIDGET_BUSY'), 2, FAILED],
	[
		'a rejected fetch',
		() => Promise.reject(new TypeError('Failed to fetch')),
		2,
		FAILED,
	],
	['HTTP 502 with an HTML body', () => html(502), 2, FAILED],
	['a 2xx body that is not JSON', () => html(200), 2, FAILED],
	['INTERNAL_ERROR', () => graphqlError('INTERNAL_ERROR'), 1, FAILED],
	[
		'HTTP 200 with errors of an unknown type',
		() => graphqlError('SOMETHING_NEW'),
		1,
		FAILED,
	],
	[
		'HTTP 400 with errors and no type',
		() =>
			jsonResponse(
				{ errors: [{ message: `Unknown field ${BODY_MARKER}` }] },
				400,
			),
		1,
		FAILED,
	],
	['HTTP 403 without a GraphQL body', () => html(403), 1, FAILED],
	['HTTP 429 without a GraphQL body', () => html(429), 1, FAILED],
	[
		'a 2xx body with neither errors nor data.metricWidget',
		() => jsonResponse({ data: {}, extensions: { note: BODY_MARKER } }),
		1,
		FAILED,
	],
	['a validation failure', invalidResponse, 1, FAILED],
];

describe('error mapping in the app: calls and screen per row', () => {
	it.each(
		ROWS,
	)('%s: %i R-YEAR call(s)', async (_name, answer, calls, shown) => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
		vi.spyOn(Math, 'random').mockReturnValue(0);
		const consoleSpies = [
			vi.spyOn(console, 'error'),
			vi.spyOn(console, 'warn'),
			vi.spyOn(console, 'log'),
		];

		const fetchMock = routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			metricWidget: answer,
		});

		render(<App doi={BOOK_DOI} />, { wrapper: createWrapper() });

		for (let i = 0; i < 10; i++) {
			await act(() => vi.advanceTimersByTimeAsync(0));
		}
		await act(() => vi.advanceTimersByTimeAsync(60_000));
		for (let i = 0; i < 10; i++) {
			await act(() => vi.advanceTimersByTimeAsync(0));
		}

		expect(yearInputs(fetchMock)).toHaveLength(calls);
		expect(screen.getByText(shown)).toBeTruthy();

		const retry = screen.queryByRole('button', { name: 'Retry' });

		if (shown === NOT_AVAILABLE) {
			expect(retry).toBeNull();
			expect(screen.queryByText(FAILED)).toBeNull();
		} else {
			expect(retry).toBeTruthy();
			expect(screen.queryByText(NOT_AVAILABLE)).toBeNull();
		}

		// Unit 17: no response body, error body, DOI or variables reach the console on this path.
		const logged = consoleSpies
			.flatMap((spy) => spy.mock.calls)
			.map((args) =>
				args
					.map((arg) =>
						arg instanceof Error
							? `${arg.message} ${arg.stack ?? ''}`
							: typeof arg === 'string'
								? arg
								: (JSON.stringify(arg) ?? String(arg)),
					)
					.join(' '),
			)
			.join('\n');

		for (const secret of [
			BODY_MARKER,
			'A fixed error message.',
			BOOK_DOI,
			E,
			'timelineGrain',
			'"input"',
		]) {
			expect(logged).not.toContain(secret);
		}
	});
});
