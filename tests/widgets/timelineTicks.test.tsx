import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { cloneElement, type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { yearBuckets } from '@/shared';
import {
	E,
	graphqlData,
	NOW,
	OAPEN_DOWNLOADS,
	response,
	section,
	series,
	total,
} from '../fixtures/metricWidget';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

// The real map package cannot load under Node 22.14 (CI); see the stub.
vi.mock('react-simple-maps', () => import('../helpers/reactSimpleMapsStub'));

// jsdom lays nothing out: the charts get a fixed size, the width of a 640 px widget's plot.
vi.mock('recharts', async (importOriginal) => {
	const actual = await importOriginal<typeof import('recharts')>();

	return {
		...actual,
		ResponsiveContainer: ({ children }: { children: ReactElement }) =>
			cloneElement(
				children as ReactElement<{ width: number; height: number }>,
				{
					width: 592,
					height: 300,
				},
			),
	};
});

/** Recharts measures a tick label in a hidden span; jsdom gives it no size, so give it 7 px a character. */
const measureTextByLength = () => {
	const original = HTMLElement.prototype.getBoundingClientRect;

	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
		function (this: HTMLElement) {
			if (this.id !== 'recharts_measurement_span') return original.call(this);

			const width = (this.textContent ?? '').length * 7;

			return {
				width,
				height: 14,
				top: 0,
				left: 0,
				right: width,
				bottom: 14,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			};
		},
	);
};

/** 12 year buckets, 2015 (Mar–Dec) to 2026 (Jan–Nov): one full page, with a part-year label at each end. */
const twelveYears = () => {
	const ranges = yearBuckets('2015-03-01', E);

	return response({
		startDate: '2015-03-01',
		work: section({
			totals: [total(OAPEN_DOWNLOADS, '78')],
			timeline: series(
				OAPEN_DOWNLOADS,
				ranges,
				ranges.map((_, index) => String(index + 1)),
			),
		}),
	});
};

const xTickLabels = () =>
	Array.from(
		screen
			.getByRole('tabpanel')
			.querySelectorAll('.recharts-xAxis-tick-labels text'),
	).map((node) =>
		Array.from(node.querySelectorAll('tspan'))
			.map((line) => line.textContent)
			.join(' '),
	);

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(NOW);
	measureTextByLength();
});

describe('Timeline year ticks', () => {
	it('draws a tick for each of the 12 buckets of a page, part-year labels included', async () => {
		routeFetch({
			works: { [BOOK_DOI_URL]: workWithChapters },
			metricWidget: () => graphqlData(twelveYears()),
		});
		render(<App doi={BOOK_DOI} />, { wrapper: createWrapper() });

		fireEvent.mouseDown(await screen.findByRole('tab', { name: 'Timeline' }));
		await screen.findByText('Mar 2015 – Nov 2026', {}, { timeout: 5000 });
		// The chart has drawn its x axis (its first tick) once its data are in.
		await waitFor(() => expect(xTickLabels()[0]).toBe('2015 (Mar–Dec)'));

		expect(xTickLabels()).toEqual([
			'2015 (Mar–Dec)',
			'2016',
			'2017',
			'2018',
			'2019',
			'2020',
			'2021',
			'2022',
			'2023',
			'2024',
			'2025',
			'2026 (Jan–Nov)',
		]);
	});
});
