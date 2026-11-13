import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import type { MetricWidgetInput, WorkDto } from '@/shared/interfaces';
import {
	E,
	emptyResponse,
	graphqlData,
	graphqlError,
	monthResponse,
	NOW,
	oneBucketResponse,
	yearResponse,
} from '../fixtures/metricWidget';
import {
	BOOK_DOI,
	BOOK_DOI_URL,
	CHAPTER_1_DOI,
	CHAPTER_2_DOI,
	workWithChapters,
} from '../fixtures/works';
import {
	metadataRequests,
	monthInputs,
	otherHostRequests,
	routeFetch,
	yearInputs,
} from '../helpers/routeFetch';
import { createSelectableWrapper, createWrapper } from '../helpers/wrapper';

// The real map package cannot load under Node 22.14 (CI); see the stub.
vi.mock('react-simple-maps', () => import('../helpers/reactSimpleMapsStub'));

/**
 * Holds the Timeline tab back until a test releases it, so that it mounts, and reads `E`, later than the other
 * tabs. Every other test leaves it released, and the real tab mounts as usual.
 */
const lateTimeline = vi.hoisted(() => {
	let isHeld = false;
	const listeners = new Set<() => void>();

	return {
		hold: () => {
			isHeld = true;
		},
		release: () => {
			isHeld = false;
			for (const listener of listeners) listener();
		},
		isHeld: () => isHeld,
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
	};
});

vi.mock('@/widgets/TimelineTab/TimelineTab', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('@/widgets/TimelineTab/TimelineTab')>();
	const { createElement, useSyncExternalStore } = await import('react');

	return {
		...actual,
		TimelineTab: (props: Parameters<typeof actual.TimelineTab>[0]) =>
			useSyncExternalStore(lateTimeline.subscribe, lateTimeline.isHeld)
				? null
				: createElement(actual.TimelineTab, props),
	};
});

const TAB_NAMES = ['Measures', 'Timeline', 'Map', 'Regions', 'Countries'];

const TITLES: Record<string, string> = {
	Measures: 'Usage by measure',
	Timeline: 'Usage by measure over time',
	Map: 'Geographical Usage',
	Regions: 'Continent Usage',
	Countries: 'Top 10 countries',
};

type Handler = (input: MetricWidgetInput) => Response | Promise<Response>;

const renderApp = (
	metricWidget: Handler,
	options: {
		works?: Record<string, WorkDto>;
		wrapper?: (props: { children: ReactNode }) => ReactNode;
	} = {},
) => {
	const fetchMock = routeFetch({
		works: options.works ?? { [BOOK_DOI_URL]: workWithChapters },
		metricWidget,
	});

	render(<App doi={BOOK_DOI} />, {
		wrapper: options.wrapper ?? createWrapper(),
	});

	return fetchMock;
};

const openTab = async (name: string) => {
	fireEvent.mouseDown(await screen.findByRole('tab', { name }));
	await waitFor(() =>
		expect(screen.getByRole('tab', { name }).getAttribute('data-state')).toBe(
			'active',
		),
	);
};

const activePanel = () => screen.getByRole('tabpanel');

/** Every lazy tab has mounted once each tab trigger has been opened. */
const openEveryTab = async () => {
	for (const name of TAB_NAMES) {
		await openTab(name);
		await within(activePanel()).findAllByText(
			TITLES[name],
			{},
			{ timeout: 5000 },
		);
	}
};

const captionTexts = (container: HTMLElement) =>
	Array.from(container.querySelectorAll('p'))
		.map((node) => node.textContent ?? '')
		.filter(
			(text) =>
				/^[A-Z][a-z]{2} \d{4} – [A-Z][a-z]{2} \d{4}$/.test(text) ||
				/ by month$/.test(text) ||
				/chapter\(s\) from another publisher/.test(text),
		);

const pageText = () => document.body.textContent ?? '';

beforeEach(() => {
	lateTimeline.release();
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(NOW);
});

describe('request count, success', () => {
	it('renders every tab with one workByDoi and one R-YEAR; no R-MONTH for a multi-year response', async () => {
		const fetchMock = renderApp(() => graphqlData(yearResponse()));

		await openEveryTab();
		await within(activePanel()).findByText('Mar 2019 – Nov 2026');

		expect(metadataRequests(fetchMock)).toHaveLength(1);
		expect(yearInputs(fetchMock)).toHaveLength(1);
		expect(monthInputs(fetchMock)).toHaveLength(0);
		expect(otherHostRequests(fetchMock)).toEqual([]);
	});

	it('a tab that mounts after the clock crosses a UTC month boundary shares the first E and its R-YEAR', async () => {
		// Every tab but Timeline mounts at 23:59:59 on the last day of November, and the R-YEAR ends at E.
		lateTimeline.hold();
		vi.setSystemTime(new Date('2026-11-30T23:59:59Z'));
		const fetchMock = renderApp(() => graphqlData(yearResponse()));

		await within(activePanel()).findByText(
			'Mar 2019 – Nov 2026',
			{},
			{ timeout: 5000 },
		);
		await openTab('Countries');
		await within(activePanel()).findAllByText(
			TITLES.Countries,
			{},
			{ timeout: 5000 },
		);
		expect(yearInputs(fetchMock).map(({ endDate }) => endDate)).toEqual([E]);
		expect(screen.queryByText(TITLES.Timeline)).toBeNull();

		// In December a tab computing its own E would read up to 2027-01-01. The Timeline tab mounts only now.
		vi.setSystemTime(new Date('2026-12-01T00:00:05Z'));
		await act(async () => lateTimeline.release());
		// Time for a mounted tab to send its read, if it had a key of its own.
		await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
		expect(yearInputs(fetchMock).map(({ endDate }) => endDate)).toEqual([E]);

		await openTab('Timeline');
		await within(activePanel()).findAllByText(
			TITLES.Timeline,
			{},
			{ timeout: 5000 },
		);
		await within(activePanel()).findByText(
			'Mar 2019 – Nov 2026',
			{},
			{ timeout: 5000 },
		);

		expect(yearInputs(fetchMock).map(({ endDate }) => endDate)).toEqual([E]);
		expect(monthInputs(fetchMock)).toHaveLength(0);
	});

	it('a one-bucket response adds one R-MONTH when the Timeline tab is first opened, and not before', async () => {
		const fetchMock = renderApp((input) =>
			input.timelineGrain === 'YEAR'
				? graphqlData(oneBucketResponse())
				: graphqlData(monthResponse(input.startDate ?? '', input.endDate)),
		);

		await within(activePanel()).findByText(
			'Feb 2026 – Nov 2026',
			{},
			{ timeout: 5000 },
		);
		await openTab('Map');
		await within(activePanel()).findAllByText(
			TITLES.Map,
			{},
			{ timeout: 5000 },
		);
		expect(monthInputs(fetchMock)).toHaveLength(0);

		await openTab('Timeline');
		await within(activePanel()).findByText(
			'2026 (Feb–Nov) by month',
			{},
			{ timeout: 5000 },
		);
		expect(monthInputs(fetchMock)).toStrictEqual([
			{
				doi: BOOK_DOI,
				startDate: '2026-02-01',
				endDate: '2026-12-01',
				timelineGrain: 'MONTH',
			},
		]);

		await openTab('Measures');
		await openTab('Timeline');
		await within(activePanel()).findByText('2026 (Feb–Nov) by month');
		expect(monthInputs(fetchMock)).toHaveLength(1);
		expect(yearInputs(fetchMock)).toHaveLength(1);
	});

	it('a response with no served pair shows the empty state in every tab and never sends R-MONTH', async () => {
		const fetchMock = renderApp(() => graphqlData(emptyResponse()));

		for (const name of TAB_NAMES) {
			await openTab(name);
			const panel = activePanel();

			await within(panel).findByText(
				'Data not available',
				{},
				{ timeout: 5000 },
			);
			expect(
				within(panel).queryByRole('button', { name: 'Export CSV' }),
			).toBeNull();
			expect(captionTexts(panel)).toEqual([]);
			expect(within(panel).queryByPlaceholderText('All items')).not.toBeNull();
		}

		expect(monthInputs(fetchMock)).toHaveLength(0);
		expect(yearInputs(fetchMock)).toHaveLength(1);
	});
});

describe('request count, failure', () => {
	const dispatchFocusAndNetwork = () =>
		act(() => {
			document.dispatchEvent(new Event('visibilitychange'));
			window.dispatchEvent(new Event('visibilitychange'));
			window.dispatchEvent(new Event('focus'));
			window.dispatchEvent(new Event('offline'));
			window.dispatchEvent(new Event('online'));
		});

	it.each([
		['METRIC_WIDGET_UNAVAILABLE', 1, 'Metrics are not available for this work'],
		['INTERNAL_ERROR', 1, 'Something went wrong'],
		['METRIC_WIDGET_BUSY', 2, 'Something went wrong'],
	])(
		'%s: exactly %i R-YEAR call(s) through mounting, opening every tab, focus and network events',
		async (type, calls, text) => {
			vi.spyOn(Math, 'random').mockReturnValue(0);
			const fetchMock = renderApp(() => graphqlError(type));

			await within(activePanel()).findByText(text, {}, { timeout: 6000 });
			await openEveryTab();
			dispatchFocusAndNetwork();
			await openEveryTab();
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(yearInputs(fetchMock)).toHaveLength(calls);
			expect(monthInputs(fetchMock)).toHaveLength(0);
		},
		15_000,
	);
});

describe('placement', () => {
	it('an R-YEAR failure shows its state in every tab, keeping the tab bar and each header, without a CSV button', async () => {
		renderApp(() => graphqlError('INTERNAL_ERROR'));

		for (const name of TAB_NAMES) {
			await openTab(name);
			const panel = activePanel();

			await within(panel).findByText(
				'Something went wrong',
				{},
				{ timeout: 5000 },
			);
			expect(within(panel).getByRole('button', { name: 'Retry' })).toBeTruthy();
			expect(
				within(panel).queryByRole('button', { name: 'Export CSV' }),
			).toBeNull();
			expect(
				within(panel).getByRole('button', { name: 'Toggle information panel' }),
			).toBeTruthy();
			expect(within(panel).getByPlaceholderText('All items')).toBeTruthy();
			expect(screen.getAllByRole('tab')).toHaveLength(5);
		}
	});

	it('"not available" has no retry button', async () => {
		renderApp(() => graphqlError('METRIC_QUERY_LIMIT_EXCEEDED'));

		await within(activePanel()).findByText(
			'Metrics are not available for this work',
			{},
			{ timeout: 5000 },
		);
		expect(
			within(activePanel()).queryByRole('button', { name: 'Retry' }),
		).toBeNull();
	});

	it('an R-MONTH failure shows its state in the month chart only; Measures keeps its data', async () => {
		const fetchMock = renderApp((input) =>
			input.timelineGrain === 'YEAR'
				? graphqlData(oneBucketResponse())
				: graphqlError('INTERNAL_ERROR'),
		);

		await openTab('Timeline');
		const timeline = activePanel();

		await within(timeline).findByText(
			'Something went wrong',
			{},
			{ timeout: 5000 },
		);
		// The only year is shown, selected (it is open) and still enabled.
		const yearFilter = within(timeline).getByPlaceholderText(
			'1 year',
		) as HTMLInputElement;
		expect(yearFilter.hasAttribute('data-disabled')).toBe(false);
		expect(
			within(timeline).queryByRole('button', { name: 'Export CSV' }),
		).toBeNull();

		fireEvent.click(within(timeline).getByRole('button', { name: 'Retry' }));
		await waitFor(() => expect(monthInputs(fetchMock)).toHaveLength(2));

		await openTab('Measures');
		const measures = activePanel();

		await within(measures).findByText('Feb 2026 – Nov 2026');
		expect(
			within(measures).getByRole('button', { name: 'Export CSV' }),
		).toBeTruthy();
		expect(within(measures).queryByText('Something went wrong')).toBeNull();
	});
});

describe('captions', () => {
	it('show the period read and the excluded chapters, and nothing about completeness, in every tab', async () => {
		renderApp(() => graphqlData({ ...yearResponse(), excludedChildCount: 1 }));

		for (const name of TAB_NAMES) {
			await openTab(name);
			const panel = activePanel();

			await within(panel).findAllByText(TITLES[name], {}, { timeout: 5000 });
			await within(panel).findByText('Mar 2019 – Nov 2026');
			expect(captionTexts(panel)).toEqual([
				'Mar 2019 – Nov 2026',
				'1 chapter(s) from another publisher not included.',
			]);
			expect(pageText()).not.toMatch(/incomplete/i);
		}
	});

	it('the month view states "<bucket> by month", including the current month, without "incomplete"', async () => {
		renderApp((input) =>
			input.timelineGrain === 'YEAR'
				? graphqlData(oneBucketResponse())
				: graphqlData(monthResponse(input.startDate ?? '', input.endDate)),
		);

		await openTab('Timeline');
		const panel = activePanel();

		await within(panel).findByText(
			'2026 (Feb–Nov) by month',
			{},
			{ timeout: 5000 },
		);
		expect(captionTexts(panel)).toEqual(['2026 (Feb–Nov) by month']);
		expect(pageText()).not.toMatch(/incomplete/i);
	});

	it('no state says "incomplete": error and empty states', async () => {
		renderApp(() => graphqlError('INTERNAL_ERROR'));
		await within(activePanel()).findByText(
			'Something went wrong',
			{},
			{ timeout: 5000 },
		);
		expect(captionTexts(activePanel())).toEqual([]);
		expect(pageText()).not.toMatch(/incomplete/i);
	});
});

describe('info panel', () => {
	it('lists the served pairs with their definition and description, as plain text', async () => {
		renderApp(() =>
			graphqlData({
				...yearResponse(),
				work: {
					...yearResponse().work,
					totals: [
						...yearResponse().work.totals,
						{
							platformId: '0c0c0c0c-0000-4000-8000-000000000003',
							measureId: '1e1e1e1e-0000-4000-8000-000000000002',
							value: '1',
						},
					],
				},
			}),
		);

		await within(activePanel()).findByText(
			'Mar 2019 – Nov 2026',
			{},
			{ timeout: 5000 },
		);
		fireEvent.click(
			within(activePanel()).getByRole('button', {
				name: 'Toggle information panel',
			}),
		);

		const panel = activePanel();
		const triggers = within(panel)
			.getAllByRole('button')
			.map((button) => button.textContent)
			.filter((text) => text?.includes(' · '));

		expect(triggers).toEqual([
			'OAPEN · Downloads',
			'Open Book Publishers · Views',
			'Zenodo · Views',
		]);

		fireEvent.click(
			within(panel).getByRole('button', { name: 'Zenodo · Views' }),
		);

		const description = await within(panel).findByText(
			'Zenodo <b>record</b> statistics.',
		);

		expect(description.querySelector('b')).toBeNull();
		expect(within(panel).getByText('Times a page was viewed.')).toBeTruthy();
	});
});

describe('header kept with a chapter selection', () => {
	const selectionHandler: Handler = (input) => {
		if (!input.chapterDois) return graphqlData(yearResponse());
		if (input.chapterDois.includes(CHAPTER_1_DOI))
			return graphqlData(emptyResponse());

		return graphqlError('METRIC_QUERY_INVALID');
	};

	it.each([
		[CHAPTER_1_DOI, 'Data not available'],
		[CHAPTER_2_DOI, 'Metrics are not available for this work'],
	])('selecting %s keeps every header with the dropdown; clearing it shows the unselected data with no new request', async (chapter, text) => {
		const { Wrapper, selectChapters } = createSelectableWrapper();
		const fetchMock = renderApp(selectionHandler, { wrapper: Wrapper });

		await within(activePanel()).findByText(
			'Mar 2019 – Nov 2026',
			{},
			{ timeout: 5000 },
		);
		await selectChapters([{ label: 'Chapter', value: chapter }]);

		for (const name of TAB_NAMES) {
			await openTab(name);
			const panel = activePanel();

			await within(panel).findByText(text, {}, { timeout: 5000 });
			expect(within(panel).getByPlaceholderText('1 chapter')).toBeTruthy();
			expect(within(panel).getAllByText(TITLES[name]).length).toBeGreaterThan(
				0,
			);
		}

		expect(yearInputs(fetchMock)).toHaveLength(2);

		await selectChapters([]);
		await openTab('Measures');
		await within(activePanel()).findByText('Mar 2019 – Nov 2026');
		expect(yearInputs(fetchMock)).toHaveLength(2);
	});

	it('with the unselected R-YEAR answering INTERNAL_ERROR, every tab keeps its header and the chapter dropdown', async () => {
		renderApp(() => graphqlError('INTERNAL_ERROR'));

		for (const name of TAB_NAMES) {
			await openTab(name);
			const panel = activePanel();

			await within(panel).findByText(
				'Something went wrong',
				{},
				{ timeout: 5000 },
			);
			expect(within(panel).getByPlaceholderText('All items')).toBeTruthy();
		}
	});
});

describe('console silence in the app', () => {
	it('never writes a response body or the variables to the console', async () => {
		const spies = [
			vi.spyOn(console, 'error'),
			vi.spyOn(console, 'warn'),
			vi.spyOn(console, 'log'),
		];

		renderApp(
			() =>
				new Response('<html>SECRET-BODY-TEXT</html>', {
					status: 403,
					headers: { 'content-type': 'text/html' },
				}),
		);

		await within(activePanel()).findByText(
			'Something went wrong',
			{},
			{ timeout: 5000 },
		);
		await openEveryTab();

		const logged = spies
			.flatMap((spy) => spy.mock.calls)
			.map((args) => args.map(String).join(' '))
			.join('\n');

		expect(logged).not.toContain('SECRET-BODY-TEXT');
		expect(logged).not.toContain(BOOK_DOI);
	});
});
