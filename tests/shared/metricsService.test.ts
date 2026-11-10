import MetricsService from '@/shared/services/metricsService';
import { describe, expect, it } from 'vitest';
import { jsonResponse, requestedUrls, stubFetch } from '../helpers/fetch';

// The tracked measures, in the order the service appends them to the filter.
// Pinned here on purpose: changing the list changes every request URL.
const MEASURE_URIS = [
	'https://metrics.operas-eu.org/google-books/views/v1',
	'https://metrics.operas-eu.org/obp-html/sessions/v1',
	'https://metrics.operas-eu.org/obp-pdf/sessions/v1',
	'https://metrics.operas-eu.org/obp/downloads/v1',
	'https://metrics.operas-eu.org/world-reader/users/v1',
	'https://metrics.operas-eu.org/open-edition/views/v1',
	'https://metrics.operas-eu.org/open-edition/downloads/v1',
	'https://metrics.operas-eu.org/oapen/downloads/v1',
	'https://metrics.operas-eu.org/jstor/views/v1',
	'https://metrics.operas-eu.org/jstor/downloads/v1',
	'https://metrics.operas-eu.org/classics-library/sessions/v1',
	'https://metrics.operas-eu.org/unglueit/downloads/v1',
	'https://metrics.operas-eu.org/openaire/downloads/v1',
	'https://metrics.operas-eu.org/wikimedia/views/v1',
	'https://metrics.operas-eu.org/sub-gottingen/downloads/v1',
	'https://metrics.operas-eu.org/ekt/downloads/v1',
	'https://metrics.operas-eu.org/ekt/sessions/v1',
	'https://metrics.operas-eu.org/ekt/landingsessions/v1',
	'https://metrics.operas-eu.org/wikipedia/references/v1',
	'https://metrics.operas-eu.org/wordpress/references/v1',
	'https://metrics.operas-eu.org/figshare/views/v1',
	'https://metrics.operas-eu.org/figshare/downloads/v1',
	'https://metrics.operas-eu.org/figshare/shares/v1',
	'https://metrics.operas-eu.org/uplo/sessions/v1',
	'https://metrics.operas-eu.org/uplo/reads/v1',
	'https://metrics.operas-eu.org/uplo/downloads/v1',
	'https://metrics.operas-eu.org/historical/downloads/v1',
];
const MEASURE_FILTER = MEASURE_URIS.map((uri) => `measure_uri:${uri}`).join(
	',',
);

const BASE = 'https://metrics.test/events?aggregation=';
const BOOK = '10.11647/book';

const filterUrl = (dois: string[]) =>
	`&filter=${dois.map((doi) => `work_uri:info:doi:${doi}`).join(',')},${MEASURE_FILTER}`;

const chapters = (count: number) =>
	Array.from({ length: count }, (_, i) => `10.11647/book.${i + 1}`);

describe('MetricsService URLs', () => {
	it('builds the exact year URL (no dates) for a book with two chapters', async () => {
		const fetchMock = stubFetch();

		await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: ['10.11647/book.1', '10.11647/book.2'],
		});

		expect(fetchMock).toHaveBeenCalledTimes(2);
		// Fetch is called with the URL only (no init argument).
		expect(fetchMock.mock.calls[0]).toEqual([
			`${BASE}year,measure_uri${filterUrl([BOOK])}`,
		]);
		expect(fetchMock.mock.calls[1]).toEqual([
			`${BASE}year,measure_uri${filterUrl(['10.11647/book.1', '10.11647/book.2'])}`,
		]);
	});

	it('builds the exact country URL (no dates)', async () => {
		const fetchMock = stubFetch();

		await new MetricsService().getMetricsByCountry({
			workDoi: BOOK,
			chaptersDoi: ['10.11647/book.1'],
		});

		expect(requestedUrls(fetchMock)).toEqual([
			`${BASE}country_uri,measure_uri${filterUrl([BOOK])}`,
			`${BASE}country_uri,measure_uri${filterUrl(['10.11647/book.1'])}`,
		]);
	});

	it('builds the exact month URL with start and end dates before the filter', async () => {
		const fetchMock = stubFetch();

		await new MetricsService().getMetricsByMonth({
			workDoi: BOOK,
			chaptersDoi: ['10.11647/book.1'],
			startDate: '2024-01-01',
			endDate: '2025-01-01',
		});

		expect(requestedUrls(fetchMock)).toEqual([
			`${BASE}measure_uri,month&start_date=2024-01-01&end_date=2025-01-01${filterUrl([BOOK])}`,
			`${BASE}measure_uri,month&start_date=2024-01-01&end_date=2025-01-01${filterUrl(['10.11647/book.1'])}`,
		]);
	});

	it('omits empty start and end dates from the month URL', async () => {
		const fetchMock = stubFetch();

		await new MetricsService().getMetricsByMonth({
			workDoi: BOOK,
			chaptersDoi: [],
			startDate: '',
			endDate: '2025-01-01',
		});

		expect(requestedUrls(fetchMock)[0]).toBe(
			`${BASE}measure_uri,month&end_date=2025-01-01${filterUrl([BOOK])}`,
		);
	});

	it('joins DOIs with ",work_uri:info:doi:" and measures with ",measure_uri:"', async () => {
		const fetchMock = stubFetch();

		await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: ['a/1', 'b/2', 'c/3'],
		});

		const [, chaptersUrl] = requestedUrls(fetchMock);

		expect(chaptersUrl).toContain(
			'&filter=work_uri:info:doi:a/1,work_uri:info:doi:b/2,work_uri:info:doi:c/3,measure_uri:https://metrics.operas-eu.org/google-books/views/v1,measure_uri:https://metrics.operas-eu.org/obp-html/sessions/v1,',
		);
		expect(
			chaptersUrl.endsWith(
				',measure_uri:https://metrics.operas-eu.org/historical/downloads/v1',
			),
		).toBe(true);
	});

	it('does not URL-encode DOIs or measure URIs', async () => {
		const fetchMock = stubFetch();

		await new MetricsService().getMetricsByYear({
			workDoi: '10.1000/a b#c',
			chaptersDoi: [],
		});

		expect(requestedUrls(fetchMock)[0]).toContain(
			'work_uri:info:doi:10.1000/a b#c,measure_uri:https://',
		);
	});

	it('makes no request and returns empty metrics when the work DOI is empty', async () => {
		const fetchMock = stubFetch();

		const result = await new MetricsService().getMetricsByYear({
			workDoi: '',
			chaptersDoi: ['10.11647/book.1'],
		});

		expect(fetchMock).not.toHaveBeenCalled();
		expect(result).toEqual({ bookMetrics: [], chaptersMetrics: [] });
	});
});

describe('MetricsService chapter chunking (30 DOIs per request)', () => {
	it.each([
		// count, expected chapter-request sizes
		[1, [1]],
		[29, [29]],
		[30, [30]],
		[31, [30, 1]],
		[60, [30, 30]],
		[61, [30, 30, 1]],
	])('%i chapters -> chapter requests of %j DOIs', async (count, sizes) => {
		const fetchMock = stubFetch();
		const dois = chapters(count);

		await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: dois,
		});

		const urls = requestedUrls(fetchMock);

		// One book request first, then one request per chunk.
		expect(urls).toHaveLength(1 + sizes.length);
		expect(urls[0]).toBe(`${BASE}year,measure_uri${filterUrl([BOOK])}`);

		let offset = 0;
		sizes.forEach((size, i) => {
			const chunk = dois.slice(offset, offset + size);

			expect(urls[i + 1]).toBe(`${BASE}year,measure_uri${filterUrl(chunk)}`);
			offset += size;
		});
		expect(offset).toBe(count);
	});

	it('still sends a chapters request with an empty DOI when there are 0 chapters', async () => {
		const fetchMock = stubFetch();

		await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: [],
		});

		const urls = requestedUrls(fetchMock);

		// Today's behaviour: do/while always runs once, so an empty chunk is
		// requested with a dangling "work_uri:info:doi:" and no DOI after it.
		expect(urls).toHaveLength(2);
		expect(urls[1]).toBe(
			`${BASE}year,measure_uri&filter=work_uri:info:doi:,${MEASURE_FILTER}`,
		);
	});
});

describe('MetricsService response handling', () => {
	const bookRow = { year: '2024', data: [] as unknown[], marker: 'book' };
	const chunk1Row = { year: '2024', data: [] as unknown[], marker: 'chunk-1' };
	const chunk2Row = { year: '2025', data: [] as unknown[], marker: 'chunk-2' };

	it('puts the first response in bookMetrics and concatenates the rest into chaptersMetrics in order', async () => {
		stubFetch()
			.mockResolvedValueOnce(jsonResponse({ data: [bookRow] }))
			.mockResolvedValueOnce(jsonResponse({ data: [chunk1Row] }))
			.mockResolvedValueOnce(jsonResponse({ data: [chunk2Row] }));

		const result = await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: chapters(31),
		});

		expect(result).toEqual({
			bookMetrics: [bookRow],
			chaptersMetrics: [chunk1Row, chunk2Row],
		});
	});

	it('keeps chunk order even when a later chunk resolves first', async () => {
		stubFetch()
			.mockResolvedValueOnce(jsonResponse({ data: [bookRow] }))
			.mockImplementationOnce(
				() =>
					new Promise((resolve) =>
						setTimeout(() => resolve(jsonResponse({ data: [chunk1Row] })), 20),
					),
			)
			.mockResolvedValueOnce(jsonResponse({ data: [chunk2Row] }));

		const result = await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: chapters(31),
		});

		expect(result.chaptersMetrics).toEqual([chunk1Row, chunk2Row]);
	});

	it('returns the same shape for the country and month aggregations', async () => {
		stubFetch()
			.mockResolvedValueOnce(jsonResponse({ data: [bookRow] }))
			.mockResolvedValueOnce(jsonResponse({ data: [chunk1Row] }))
			.mockResolvedValueOnce(jsonResponse({ data: [bookRow] }))
			.mockResolvedValueOnce(jsonResponse({ data: [chunk1Row] }));
		const service = new MetricsService();

		const byCountry = await service.getMetricsByCountry({
			workDoi: BOOK,
			chaptersDoi: [],
		});
		const byMonth = await service.getMetricsByMonth({
			workDoi: BOOK,
			chaptersDoi: [],
			startDate: '2024-01-01',
			endDate: '2025-01-01',
		});

		expect(byCountry).toEqual({
			bookMetrics: [bookRow],
			chaptersMetrics: [chunk1Row],
		});
		expect(byMonth).toEqual(byCountry);
	});

	it('silently skips a rejected chapters request and keeps the others', async () => {
		stubFetch()
			.mockResolvedValueOnce(jsonResponse({ data: [bookRow] }))
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce(jsonResponse({ data: [chunk2Row] }));

		const result = await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: chapters(31),
		});

		expect(result).toEqual({
			bookMetrics: [bookRow],
			chaptersMetrics: [chunk2Row],
		});
	});

	it('leaves bookMetrics empty when the book request is rejected, without shifting chunks into it', async () => {
		stubFetch()
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce(jsonResponse({ data: [chunk1Row] }))
			.mockResolvedValueOnce(jsonResponse({ data: [chunk2Row] }));

		const result = await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: chapters(31),
		});

		// The index still advances on rejection, so chapters stay chapters.
		expect(result).toEqual({
			bookMetrics: [],
			chaptersMetrics: [chunk1Row, chunk2Row],
		});
	});

	it('resolves with empty metrics when every request is rejected', async () => {
		stubFetch(async () => {
			throw new Error('offline');
		});

		const result = await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: chapters(31),
		});

		expect(result).toEqual({ bookMetrics: [], chaptersMetrics: [] });
	});

	it('does not check the HTTP status: a 500 response with a data body is used as is', async () => {
		stubFetch()
			.mockResolvedValueOnce(jsonResponse({ data: [bookRow] }, 500))
			.mockResolvedValueOnce(jsonResponse({ data: [] }, 404));

		const result = await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: [],
		});

		expect(result).toEqual({ bookMetrics: [bookRow], chaptersMetrics: [] });
	});

	it('sets bookMetrics to undefined when the book body has no "data" key', async () => {
		stubFetch()
			.mockResolvedValueOnce(jsonResponse({ error: 'bad request' }, 400))
			.mockResolvedValueOnce(jsonResponse({ data: [] }));

		const result = await new MetricsService().getMetricsByYear({
			workDoi: BOOK,
			chaptersDoi: [],
		});

		expect(result.bookMetrics).toBeUndefined();
		expect(result.chaptersMetrics).toEqual([]);
	});

	it('rejects with a TypeError when a chapters body has no "data" key', async () => {
		stubFetch()
			.mockResolvedValueOnce(jsonResponse({ data: [] }))
			.mockResolvedValueOnce(jsonResponse({ error: 'bad request' }, 400));

		await expect(
			new MetricsService().getMetricsByYear({
				workDoi: BOOK,
				chaptersDoi: [],
			}),
		).rejects.toBeInstanceOf(TypeError);
	});

	it('rejects when a response body is not valid JSON (only fetch rejections are tolerated)', async () => {
		stubFetch()
			.mockResolvedValueOnce(new Response('<html>oops</html>', { status: 502 }))
			.mockResolvedValueOnce(jsonResponse({ data: [] }));

		await expect(
			new MetricsService().getMetricsByYear({
				workDoi: BOOK,
				chaptersDoi: [],
			}),
		).rejects.toBeInstanceOf(SyntaxError);
	});
});
