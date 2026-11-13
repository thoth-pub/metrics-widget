import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MetricWidgetInput } from '@/shared/interfaces';
import { useTimelineTab } from '@/widgets/TimelineTab/useTimelineTab';
import {
	E,
	emptyResponse,
	graphqlData,
	graphqlError,
	monthResponse,
	NOW,
	yearResponse,
} from '../fixtures/metricWidget';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { monthInputs, routeFetch, yearInputs } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

const YEAR_A = { label: '2024', value: '2024-01-01' };
const YEAR_B = { label: '2020', value: '2020-01-01' };

const renderTimeline = (
	monthHandler: (input: MetricWidgetInput) => Response,
	isActive = true,
) => {
	const fetchMock = routeFetch({
		works: { [BOOK_DOI_URL]: workWithChapters },
		metricWidget: (input) =>
			input.timelineGrain === 'YEAR'
				? graphqlData(yearResponse())
				: monthHandler(input),
	});
	const view = renderHook(
		({ active }: { active: boolean }) => useTimelineTab(BOOK_DOI, active),
		{ wrapper: createWrapper(), initialProps: { active: isActive } },
	);

	return { fetchMock, ...view };
};

describe('Timeline month read (R-MONTH)', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(NOW);
	});

	it('is not sent for the year view; opening one year adds one R-MONTH for that bucket', async () => {
		const { fetchMock, result } = renderTimeline((input) =>
			graphqlData(monthResponse(input.startDate ?? '', input.endDate)),
		);

		await waitFor(() => expect(result.current.year.view).not.toBeNull());
		expect(result.current.isMonthView).toBe(false);
		expect(result.current.rows.map(({ label }) => label)).toEqual([
			'2019 (Mar–Dec)',
			'2020',
			'2021',
			'2022',
			'2023',
			'2024',
			'2025',
			'2026 (Jan–Nov)',
		]);
		expect(monthInputs(fetchMock)).toHaveLength(0);

		act(() => result.current.setSelectedYears([YEAR_A]));

		await waitFor(() => expect(result.current.month.view).not.toBeNull());
		expect(monthInputs(fetchMock)).toStrictEqual([
			{
				doi: BOOK_DOI,
				startDate: '2024-01-01',
				endDate: '2025-01-01',
				timelineGrain: 'MONTH',
			},
		]);
		expect(yearInputs(fetchMock)).toHaveLength(1);
		expect(result.current.captions).toEqual(['2024 by month']);
		expect(result.current.rows).toHaveLength(12);
	});

	it('reads the first and the last part-year bucket from the served start and up to E', async () => {
		const { fetchMock, result } = renderTimeline((input) =>
			graphqlData(monthResponse(input.startDate ?? '', input.endDate)),
		);

		await waitFor(() => expect(result.current.year.view).not.toBeNull());
		act(() =>
			result.current.setSelectedYears([
				{ label: '2019 (Mar–Dec)', value: '2019-03-01' },
			]),
		);
		await waitFor(() => expect(monthInputs(fetchMock)).toHaveLength(1));
		act(() =>
			result.current.setSelectedYears([
				{ label: '2026 (Jan–Nov)', value: '2026-01-01' },
			]),
		);
		await waitFor(() => expect(monthInputs(fetchMock)).toHaveLength(2));

		expect(
			monthInputs(fetchMock).map(({ startDate, endDate }) => [
				startDate,
				endDate,
			]),
		).toEqual([
			['2019-03-01', '2020-01-01'],
			['2026-01-01', E],
		]);
	});

	it('is not sent while the Timeline tab is not the active tab', async () => {
		const { fetchMock, result, rerender } = renderTimeline(
			(input) =>
				graphqlData(monthResponse(input.startDate ?? '', input.endDate)),
			false,
		);

		await waitFor(() => expect(result.current.year.view).not.toBeNull());
		act(() => result.current.setSelectedYears([YEAR_A]));
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(monthInputs(fetchMock)).toHaveLength(0);

		rerender({ active: true });
		await waitFor(() => expect(monthInputs(fetchMock)).toHaveLength(1));
	});

	it('keeps the series filter by pair key and draws only the pairs R-MONTH serves', async () => {
		const { result } = renderTimeline((input) =>
			graphqlData(monthResponse(input.startDate ?? '', input.endDate)),
		);

		await waitFor(() => expect(result.current.year.view).not.toBeNull());
		const keys = result.current.seriesOptions.map(({ value }) => value);

		act(() => result.current.selectSeries(result.current.seriesOptions));
		act(() => result.current.setSelectedYears([YEAR_A]));
		await waitFor(() => expect(result.current.month.view).not.toBeNull());

		expect(result.current.selectedSeries.map(({ value }) => value)).toEqual(
			keys,
		);
		expect(result.current.series.map(({ pairKey }) => pairKey)).toEqual([
			keys[0],
		]);
	});

	it('shows "Data not available" in the month chart when R-MONTH serves no pair, keeping the year filter', async () => {
		const { result } = renderTimeline((input) =>
			graphqlData(emptyResponse(input.startDate, input.endDate)),
		);

		await waitFor(() => expect(result.current.year.view).not.toBeNull());
		act(() => result.current.setSelectedYears([YEAR_A]));
		await waitFor(() => expect(result.current.month.view).not.toBeNull());

		expect(result.current.month.view?.isEmpty).toBe(true);
		expect(result.current.yearsOptions).toHaveLength(8);
		expect(result.current.series).toEqual([]);
		expect(result.current.captions).toEqual([]);
	});

	it('an R-MONTH failure leaves the year view with its data', async () => {
		const { result } = renderTimeline(() => graphqlError('INTERNAL_ERROR'));

		await waitFor(() => expect(result.current.year.view).not.toBeNull());
		act(() => result.current.setSelectedYears([YEAR_A]));
		await waitFor(() => expect(result.current.month.error).not.toBeNull());

		expect(result.current.year.error).toBeNull();
		act(() => result.current.setSelectedYears([]));

		expect(result.current.isMonthView).toBe(false);
		expect(result.current.rows).toHaveLength(8);
		expect(result.current.captions).toEqual(['Mar 2019 – Nov 2026']);
	});
});

describe('a failed R-MONTH is never sent again by navigation or time', () => {
	it('open A, leave the tab and come back, close and reopen A, open B, open A again, wait 10 minutes: one read each', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		vi.setSystemTime(NOW);

		const { fetchMock, result, rerender } = renderTimeline(() =>
			graphqlError('METRIC_WIDGET_UNAVAILABLE'),
		);
		const monthReads = (startDate: string) =>
			monthInputs(fetchMock).filter((input) => input.startDate === startDate)
				.length;
		const settle = () => act(() => vi.advanceTimersByTimeAsync(100));

		await waitFor(() => expect(result.current.year.view).not.toBeNull());

		act(() => result.current.setSelectedYears([YEAR_A]));
		await waitFor(() => expect(result.current.month.error).not.toBeNull());
		expect(monthReads(YEAR_A.value)).toBe(1);

		rerender({ active: false });
		await settle();
		rerender({ active: true });
		await settle();
		expect(result.current.month.error).not.toBeNull();

		act(() => result.current.setSelectedYears([]));
		await settle();
		act(() => result.current.setSelectedYears([YEAR_A]));
		await settle();
		expect(result.current.month.error).not.toBeNull();

		act(() => result.current.setSelectedYears([YEAR_B]));
		await waitFor(() => expect(monthReads(YEAR_B.value)).toBe(1));
		await waitFor(() => expect(result.current.month.error).not.toBeNull());

		act(() => result.current.setSelectedYears([YEAR_A]));
		await settle();

		window.dispatchEvent(new Event('visibilitychange'));
		window.dispatchEvent(new Event('focus'));
		window.dispatchEvent(new Event('offline'));
		window.dispatchEvent(new Event('online'));
		await act(() => vi.advanceTimersByTimeAsync(11 * 60 * 1000));

		expect(monthReads(YEAR_A.value)).toBe(1);
		expect(monthReads(YEAR_B.value)).toBe(1);
		expect(monthInputs(fetchMock)).toHaveLength(2);
		expect(yearInputs(fetchMock)).toHaveLength(1);
	});
});

describe('a failed R-MONTH stays cached without an observer (gcTime)', () => {
	it('open A (fails), open B, wait past the default 5-minute gcTime, reopen A: still one read of A', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		vi.setSystemTime(NOW);

		const { fetchMock, result } = renderTimeline(() =>
			graphqlError('METRIC_WIDGET_UNAVAILABLE'),
		);
		const monthReads = (startDate: string) =>
			monthInputs(fetchMock).filter((input) => input.startDate === startDate)
				.length;

		await waitFor(() => expect(result.current.year.view).not.toBeNull());

		act(() => result.current.setSelectedYears([YEAR_A]));
		await waitFor(() => expect(result.current.month.error).not.toBeNull());
		expect(monthReads(YEAR_A.value)).toBe(1);

		// A now has no observer: only B's month read is mounted.
		act(() => result.current.setSelectedYears([YEAR_B]));
		await waitFor(() => expect(monthReads(YEAR_B.value)).toBe(1));
		await waitFor(() => expect(result.current.month.error).not.toBeNull());

		await act(() => vi.advanceTimersByTimeAsync(6 * 60 * 1000));

		act(() => result.current.setSelectedYears([YEAR_A]));
		await act(() => vi.advanceTimersByTimeAsync(100));
		await waitFor(() => expect(result.current.month.error).not.toBeNull());
		await act(() => vi.advanceTimersByTimeAsync(5_000));

		expect(monthReads(YEAR_A.value)).toBe(1);
		expect(monthInputs(fetchMock)).toHaveLength(2);
	});
});
