import { useMetricsByYear } from '@/shared/hooks/useMetricsByYear';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { measure } from '../fixtures/metrics';
import { metricsRequests, routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

describe('metrics query keys', () => {
	it('do not include the book DOI: two books without chapters share one cached metrics result', async () => {
		const workA = {
			doi: 'https://doi.org/10.11647/a',
			title: 'Book A',
			workType: 'MONOGRAPH',
			relations: [],
		};
		const workB = {
			doi: 'https://doi.org/10.11647/b',
			title: 'Book B',
			workType: 'MONOGRAPH',
			relations: [],
		};
		const fetchMock = routeFetch({
			works: { [workA.doi]: workA, [workB.doi]: workB },
			bookDoi: '10.11647/a',
			metrics: {
				'year,measure_uri': {
					book: [{ year: '2024', data: [measure('OAPEN', 'downloads', 1)] }],
				},
			},
		});

		// Both hooks share the single QueryClient created by Providers.
		const { result } = renderHook(
			() => ({
				a: useMetricsByYear(workA.doi),
				b: useMetricsByYear(workB.doi),
			}),
			{ wrapper: createWrapper() },
		);

		await waitFor(() =>
			expect(result.current.b.metricsData.bookMetrics).not.toHaveLength(0),
		);
		await waitFor(() =>
			expect(result.current.a.metricsData.bookMetrics).not.toHaveLength(0),
		);

		// Book B receives the data fetched for the key shared with book A.
		expect(result.current.b.metricsData).toBe(result.current.a.metricsData);
		// 2 requests (book + empty chunk) instead of 4 (2 per book).
		expect(metricsRequests(fetchMock)).toHaveLength(2);
	});
});
