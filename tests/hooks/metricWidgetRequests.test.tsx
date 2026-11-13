import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMetricWidgetYear } from '@/shared/hooks';
import type { WorkDto } from '@/shared/interfaces';
import {
	E,
	graphqlData,
	graphqlError,
	NOW,
	yearResponse,
} from '../fixtures/metricWidget';
import {
	BOOK_DOI,
	BOOK_DOI_URL,
	CHAPTER_1_DOI,
	CHAPTER_AS_WORK_DOI,
	CHAPTER_AS_WORK_DOI_URL,
	chapterAsMainWork,
	workWithChapters,
} from '../fixtures/works';
import { jsonResponse, stubFetch } from '../helpers/fetch';
import {
	metadataRequests,
	otherHostRequests,
	routeFetch,
	THOTH_URL,
	yearInputs,
} from '../helpers/routeFetch';
import { createSelectableWrapper, createWrapper } from '../helpers/wrapper';

/** A book whose second child has an upper-case DOI and whose third child has none. */
const mixedCaseWork: WorkDto = {
	...workWithChapters,
	relations: [
		...(workWithChapters.relations ?? []).slice(0, 1),
		{
			relationOrdinal: 2,
			relatedWork: {
				doi: 'https://doi.org/10.11647/TEST.0001.02',
				title: 'Chapter Two',
				workType: 'BOOK_CHAPTER',
			},
		},
		{
			relationOrdinal: 3,
			relatedWork: {
				doi: null as unknown as string,
				title: 'Chapter Without DOI',
				workType: 'BOOK_CHAPTER',
			},
		},
	],
};

const works = {
	[BOOK_DOI_URL]: mixedCaseWork,
	[CHAPTER_AS_WORK_DOI_URL]: chapterAsMainWork,
};

const pinClock = () => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(NOW);
};

describe('R-YEAR request inputs', () => {
	beforeEach(pinClock);

	it('without a selection: { doi, endDate: E, timelineGrain: YEAR }, no startDate, no chapterDois', async () => {
		const fetchMock = routeFetch({
			works,
			metricWidget: () => graphqlData(yearResponse()),
		});

		renderHook(() => useMetricWidgetYear(BOOK_DOI), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(yearInputs(fetchMock)).toHaveLength(1));
		expect(yearInputs(fetchMock)[0]).toStrictEqual({
			doi: BOOK_DOI,
			endDate: E,
			timelineGrain: 'YEAR',
		});
		expect(otherHostRequests(fetchMock)).toEqual([]);
	});

	it('does not wait for the metadata read when nothing is selected', async () => {
		const fetchMock = stubFetch(async (...args: unknown[]) => {
			const body = JSON.parse(String((args[1] as RequestInit).body));

			return body.operationName === 'MetricWidget'
				? graphqlData(yearResponse())
				: new Promise<Response>(() => {});
		});

		renderHook(() => useMetricWidgetYear(BOOK_DOI), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(yearInputs(fetchMock)).toHaveLength(1));
		expect(metadataRequests(fetchMock)).toHaveLength(1);
	});

	it('sends the selection canonical, lower-cased, de-duplicated and sorted', async () => {
		const fetchMock = routeFetch({
			works,
			metricWidget: () => graphqlData(yearResponse()),
		});
		const { Wrapper } = createSelectableWrapper(null, [
			{ label: 'Two', value: '10.11647/TEST.0001.02' },
			{ label: 'One', value: CHAPTER_1_DOI },
			{
				label: 'One again',
				value: `https://doi.org/${CHAPTER_1_DOI.toUpperCase()}`,
			},
		]);

		renderHook(() => useMetricWidgetYear(BOOK_DOI), { wrapper: Wrapper });

		await waitFor(() => expect(yearInputs(fetchMock)).toHaveLength(1));
		expect(yearInputs(fetchMock)[0]).toStrictEqual({
			doi: BOOK_DOI,
			chapterDois: ['10.11647/test.0001.01', '10.11647/test.0001.02'],
			endDate: E,
			timelineGrain: 'YEAR',
		});
	});

	it('drops a selection left over from another DOI, and omits the field when nothing of it is a current child', async () => {
		const fetchMock = routeFetch({
			works,
			metricWidget: () => graphqlData(yearResponse()),
		});
		const { Wrapper, selectChapters } = createSelectableWrapper(null, [
			{ label: 'Elsewhere', value: '10.11647/other.0009.01' },
			{ label: 'One', value: CHAPTER_1_DOI },
		]);

		renderHook(() => useMetricWidgetYear(BOOK_DOI), { wrapper: Wrapper });

		await waitFor(() => expect(yearInputs(fetchMock)).toHaveLength(1));
		expect(yearInputs(fetchMock)[0].chapterDois).toEqual([CHAPTER_1_DOI]);

		await selectChapters([
			{ label: 'Elsewhere', value: '10.11647/other.0009.01' },
		]);

		await waitFor(() => expect(yearInputs(fetchMock)).toHaveLength(2));
		expect(yearInputs(fetchMock)[1]).toStrictEqual({
			doi: BOOK_DOI,
			endDate: E,
			timelineGrain: 'YEAR',
		});
	});

	it('never sends chapterDois for a chapter embed', async () => {
		const fetchMock = routeFetch({
			works,
			metricWidget: () => graphqlData({ ...yearResponse(), chapters: null }),
		});
		const { Wrapper } = createSelectableWrapper(null, [
			{ label: 'Stale', value: CHAPTER_1_DOI },
		]);

		renderHook(() => useMetricWidgetYear(CHAPTER_AS_WORK_DOI), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(yearInputs(fetchMock)).toHaveLength(1));
		expect(yearInputs(fetchMock)[0]).toStrictEqual({
			doi: CHAPTER_AS_WORK_DOI,
			endDate: E,
			timelineGrain: 'YEAR',
		});
	});

	it('fails the read of a chapter embed whose chapters section is not null', async () => {
		routeFetch({
			works,
			metricWidget: () => graphqlData(yearResponse()),
		});

		const { result } = renderHook(
			() => useMetricWidgetYear(CHAPTER_AS_WORK_DOI),
			{ wrapper: createWrapper() },
		);

		await waitFor(() => expect(result.current.error).not.toBeNull());
		expect(result.current.error?.reason).toBe('INVALID_RESPONSE');
		expect(result.current.view).toBeNull();
	});

	it('sends no metrics request for an invalid DOI', async () => {
		const fetchMock = routeFetch({
			works,
			metricWidget: () => graphqlData(yearResponse()),
		});

		const { result } = renderHook(() => useMetricWidgetYear('not-a-doi'), {
			wrapper: createWrapper(),
		});

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(yearInputs(fetchMock)).toHaveLength(0);
		expect(result.current.isLoading).toBe(true);
	});
});

describe('query keys', () => {
	beforeEach(pinClock);

	it('include the DOI: two books without chapters make two requests (replaces the WIDGET-TEST-01 pin)', async () => {
		const workA = {
			...workWithChapters,
			doi: 'https://doi.org/10.11647/a',
			relations: [],
		};
		const workB = {
			...workWithChapters,
			doi: 'https://doi.org/10.11647/b',
			relations: [],
		};
		const fetchMock = routeFetch({
			works: { [workA.doi]: workA, [workB.doi]: workB },
			metricWidget: () => graphqlData(yearResponse()),
		});

		const { result } = renderHook(
			() => ({
				a: useMetricWidgetYear('10.11647/a'),
				b: useMetricWidgetYear('10.11647/b'),
			}),
			{ wrapper: createWrapper() },
		);

		await waitFor(() => expect(result.current.a.view).not.toBeNull());
		await waitFor(() => expect(result.current.b.view).not.toBeNull());
		expect(
			yearInputs(fetchMock)
				.map(({ doi }) => doi)
				.sort(),
		).toEqual(['10.11647/a', '10.11647/b']);
		expect(result.current.a.view).not.toBe(result.current.b.view);
	});
});

describe('retries', () => {
	const yearCalls = (fetchMock: ReturnType<typeof stubFetch>) =>
		fetchMock.mock.calls.filter(
			([url, init]) =>
				String(url) === THOTH_URL &&
				JSON.parse(String((init as RequestInit).body)).operationName ===
					'MetricWidget',
		).length;

	const flush = () => act(() => vi.advanceTimersByTimeAsync(0));

	it('METRIC_WIDGET_BUSY is read twice, the second time not before 2 s', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
		vi.spyOn(Math, 'random').mockReturnValue(0);

		const fetchMock = stubFetch(async (...args: unknown[]) => {
			const body = JSON.parse(String((args[1] as RequestInit).body));

			return body.operationName === 'MetricWidget'
				? graphqlError('METRIC_WIDGET_BUSY')
				: jsonResponse({ data: { workByDoi: workWithChapters } });
		});

		const { result } = renderHook(() => useMetricWidgetYear(BOOK_DOI), {
			wrapper: createWrapper(),
		});

		for (let i = 0; i < 5; i++) await flush();
		expect(yearCalls(fetchMock)).toBe(1);

		await act(() => vi.advanceTimersByTimeAsync(1999));
		expect(yearCalls(fetchMock)).toBe(1);

		await act(() => vi.advanceTimersByTimeAsync(1));
		for (let i = 0; i < 5; i++) await flush();
		expect(yearCalls(fetchMock)).toBe(2);

		await act(() => vi.advanceTimersByTimeAsync(60_000));
		expect(yearCalls(fetchMock)).toBe(2);
		expect(result.current.error?.reason).toBe('METRIC_WIDGET_BUSY');
	});

	it('the retry delay is random between 2 and 4 s', async () => {
		const { metricWidgetRetryDelay } = await import(
			'@/shared/services/metricWidgetService'
		);

		vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.999);

		expect(metricWidgetRetryDelay()).toBe(2000);
		expect(metricWidgetRetryDelay()).toBeCloseTo(3998, 0);
	});

	it('pressing retry sends exactly one more read', async () => {
		pinClock();

		const fetchMock = routeFetch({
			works,
			metricWidget: () => graphqlError('INTERNAL_ERROR'),
		});

		const { result } = renderHook(() => useMetricWidgetYear(BOOK_DOI), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.error).not.toBeNull());
		expect(yearInputs(fetchMock)).toHaveLength(1);

		act(() => result.current.retry());

		await waitFor(() => expect(yearInputs(fetchMock)).toHaveLength(2));
		await waitFor(() => expect(result.current.error).not.toBeNull());
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(yearInputs(fetchMock)).toHaveLength(2);
	});
});
