import { render, screen, waitFor } from '@testing-library/react';
import { cloneElement, type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import type { MetricWidgetMeasure, MetricWidgetPlatform } from '@/shared';
import {
	graphqlData,
	NOW,
	type Pair,
	response,
	section,
	total,
} from '../fixtures/metricWidget';
import { BOOK_DOI, BOOK_DOI_URL, workWithChapters } from '../fixtures/works';
import { routeFetch } from '../helpers/routeFetch';
import { createWrapper } from '../helpers/wrapper';

// The real map package cannot load under Node 22.14 (CI); see the stub.
vi.mock('react-simple-maps', () => import('../helpers/reactSimpleMapsStub'));

// jsdom lays nothing out: the charts get a fixed size, about that of a 640 x 490 widget's chart.
vi.mock('recharts', async (importOriginal) => {
	const actual = await importOriginal<typeof import('recharts')>();

	return {
		...actual,
		ResponsiveContainer: ({ children }: { children: ReactElement }) =>
			cloneElement(
				children as ReactElement<{ width: number; height: number }>,
				{ width: 592, height: 300 },
			),
	};
});

/** Recharts measures a tick label in a hidden span; jsdom gives it no size, so give it 7 x 16 px a character. */
const measureTextByLength = () => {
	const original = HTMLElement.prototype.getBoundingClientRect;

	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
		function (this: HTMLElement) {
			if (this.id !== 'recharts_measurement_span') return original.call(this);

			const width = (this.textContent ?? '').length * 7;

			return {
				width,
				height: 16,
				top: 0,
				left: 0,
				right: width,
				bottom: 16,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			};
		},
	);
};

const SHORT_PLATFORMS = ['OAPEN', 'OBP', 'Zenodo', 'JSTOR', 'MUSE'];
const LONG_PLATFORMS = [
	'Open Book Publishers HTML Reader',
	'Open Book Publishers PDF Reader',
	'Open Book Publishers EPUB Reader',
	'OAPEN Library Repository',
	'Zenodo Research Repository',
];
const SHORT_MEASURES = ['Downloads', 'Views', 'Reads'];
const LONG_MEASURES = [
	'Total item investigations',
	'Total item requests',
	'Unique item investigations',
];

/** `count` pairs over 5 platforms and 3 measures with the given names, each with a book total. */
const manyPairs = (
	count: number,
	platformNames: string[],
	measureNames: string[],
) => {
	const platforms: MetricWidgetPlatform[] = platformNames.map(
		(displayName, index) => ({
			platformId: `${index + 1}a${index + 1}a${index + 1}a${index + 1}a-0000-4000-8000-00000000000${index + 1}`,
			code: `platform-${index + 1}`,
			displayName,
			publicDescription: null,
		}),
	);
	const measures: MetricWidgetMeasure[] = measureNames.map(
		(displayName, index) => ({
			measureId: `${index + 1}e${index + 1}e${index + 1}e${index + 1}e-0000-4000-8000-00000000000${index + 1}`,
			displayName,
			definition: `${displayName}.`,
		}),
	);
	const pairs: Pair[] = platforms
		.flatMap(({ platformId }) =>
			measures.map(({ measureId }) => ({ platformId, measureId })),
		)
		.slice(0, count);

	return response({
		platforms,
		measures,
		work: section({
			totals: pairs.map((of, index) => total(of, String((index + 1) * 10))),
		}),
	});
};

/** The drawn y-axis labels of the Measures tab, each as its lines. */
const yTickLabels = () =>
	Array.from(document.querySelectorAll('.recharts-yAxis-tick-labels text')).map(
		(node) =>
			Array.from(node.querySelectorAll('tspan')).map(
				(line) => line.textContent ?? '',
			),
	);

const renderMeasures = async (
	metricWidget: ReturnType<typeof manyPairs>,
	count: number,
) => {
	routeFetch({
		works: { [BOOK_DOI_URL]: workWithChapters },
		metricWidget: () => graphqlData(metricWidget),
	});
	render(<App doi={BOOK_DOI} />, { wrapper: createWrapper() });

	await screen.findByText('Mar 2019 – Nov 2026', {}, { timeout: 5000 });
	// The chart has drawn its y axis once its data are in.
	await waitFor(() => expect(yTickLabels().length).toBeGreaterThan(0));

	return count;
};

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(NOW);
	measureTextByLength();
});

describe('Measures axis labels in a full chart', () => {
	it.each([
		13, 15,
	])('%i pairs with short names: every bar has its label', async (count) => {
		await renderMeasures(
			manyPairs(count, SHORT_PLATFORMS, SHORT_MEASURES),
			count,
		);

		const labels = yTickLabels().map((lines) => lines.join(' '));

		expect(labels).toHaveLength(count);
		expect(new Set(labels).size).toBe(count);
	});

	it('15 pairs with long names: each label falls back to one line, and distinct pairs stay distinct', async () => {
		await renderMeasures(manyPairs(15, LONG_PLATFORMS, LONG_MEASURES), 15);

		const labels = yTickLabels();

		expect(labels).toHaveLength(15);
		for (const lines of labels) {
			expect(lines).toHaveLength(1);
			expect(lines[0].length).toBeLessThanOrEqual(20);
		}
		expect(new Set(labels.map(([line]) => line)).size).toBe(15);
	});

	it('3 pairs with long names: a band high enough keeps each label on its own lines', async () => {
		await renderMeasures(manyPairs(3, LONG_PLATFORMS, LONG_MEASURES), 3);

		expect(yTickLabels()).toEqual([
			['Open Book Publisher…', 'Total item investig…'],
			['Open Book Publisher…', 'Total item requests'],
			['Open Book Publisher…', 'Unique item investi…'],
		]);
	});
});
