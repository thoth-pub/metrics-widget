import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMeasuresTab } from '@/widgets/MeasuresTab/useMeasuresTab';
import { useTimelineTab } from '@/widgets/TimelineTab/useTimelineTab';
import {
	graphqlData,
	monthResponse,
	NOW,
	OAPEN_DOWNLOADS,
	OBP_VIEWS,
	PLATFORMS,
	yearResponse,
} from '../fixtures/metricWidget';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

const setVar = (token: string, value: string) =>
	document.documentElement.style.setProperty(`--${token}`, value);

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(NOW);
	setVar('mw-chart-metric-oapen', '#5fb0d3');
	setVar('mw-chart-metric-open-book-publishers', '#8da0f1');
	setVar('mw-chart-metric-default', '#5b65cf');
	routeFetch({
		works: { [BOOK_DOI_URL]: workWithChapters },
		metricWidget: (input) =>
			input.timelineGrain === 'YEAR'
				? graphqlData(yearResponse())
				: graphqlData(monthResponse(input.startDate ?? '', input.endDate)),
	});
});

describe('platform colours in the tabs', () => {
	it('the month view keeps the colours R-YEAR assigned', async () => {
		const { result } = renderHook(() => useTimelineTab(BOOK_DOI, true), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.year.view).not.toBeNull());
		const yearColors = Object.values(PLATFORMS).map(({ platformId }) =>
			result.current.colorOf(platformId),
		);

		expect(yearColors).toEqual(['#5fb0d3', '#8da0f1', '#5b65cf']);

		act(() =>
			result.current.setSelectedYears([{ label: '2024', value: '2024-01-01' }]),
		);
		await waitFor(() => expect(result.current.month.view).not.toBeNull());

		expect(result.current.isMonthView).toBe(true);
		expect(
			Object.values(PLATFORMS).map(({ platformId }) =>
				result.current.colorOf(platformId),
			),
		).toEqual(yearColors);
	});

	it('the Measures stripe patterns are keyed by pair, never by colour', async () => {
		const { result } = renderHook(() => useMeasuresTab(BOOK_DOI), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.measures).toHaveLength(2));

		expect(
			result.current.measures.map(({ patternKey, fill }) => [patternKey, fill]),
		).toEqual([
			[`${OAPEN_DOWNLOADS.platformId}_${OAPEN_DOWNLOADS.measureId}`, '#5fb0d3'],
			[`${OBP_VIEWS.platformId}_${OBP_VIEWS.measureId}`, '#8da0f1'],
		]);
		for (const { patternKey } of result.current.measures) {
			expect(patternKey).toMatch(/^[A-Za-z0-9_-]+$/);
		}
	});
});
