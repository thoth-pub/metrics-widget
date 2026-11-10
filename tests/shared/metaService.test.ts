import { GET_WORK_WITH_CHAPTERS_QUERY } from '@/shared/api';
import { WorkMapper } from '@/shared/mappers';
import MetaService from '@/shared/services/metaService';
import { describe, expect, it } from 'vitest';
import {
	BOOK_DOI,
	BOOK_DOI_URL,
	CHAPTER_1_DOI,
	CHAPTER_2_DOI,
	workWithChapters,
} from '../fixtures/works';
import { jsonResponse, stubFetch } from '../helpers/fetch';

describe('MetaService', () => {
	it('POSTs the GetWorkWithChapters query to the Thoth endpoint with the DOI variable', async () => {
		const fetchMock = stubFetch(async () =>
			jsonResponse({ data: { workByDoi: workWithChapters } }),
		);

		await new MetaService().getMetadata(BOOK_DOI_URL);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

		// graphql-request hands fetch a URL object, not a string.
		expect(String(url)).toBe('https://thoth.test/graphql');
		expect(init.method).toBe('POST');
		expect(JSON.parse(String(init.body))).toEqual({
			operationName: 'GetWorkWithChapters',
			query: GET_WORK_WITH_CHAPTERS_QUERY,
			variables: { doi: BOOK_DOI_URL },
		});
	});

	it('maps workByDoi to MetaData with normalized DOIs and relation ordinals', async () => {
		stubFetch(async () =>
			jsonResponse({ data: { workByDoi: workWithChapters } }),
		);

		const metadata = await new MetaService().getMetadata(BOOK_DOI_URL);

		expect(metadata).toEqual({
			book: {
				doi: BOOK_DOI,
				title: 'A Test Book',
				type: 'MONOGRAPH',
				ordinal: 0,
			},
			chapters: [
				{
					doi: CHAPTER_1_DOI,
					title: 'Chapter One',
					type: 'BOOK_CHAPTER',
					ordinal: 1,
				},
				{
					doi: CHAPTER_2_DOI,
					title: 'Chapter Two',
					type: 'BOOK_CHAPTER',
					ordinal: 2,
				},
			],
		});
	});

	it('rejects when the GraphQL response carries errors', async () => {
		stubFetch(async () =>
			jsonResponse({ errors: [{ message: 'Work not found' }], data: null }),
		);

		await expect(new MetaService().getMetadata(BOOK_DOI_URL)).rejects.toThrow(
			/Work not found/,
		);
	});
});

describe('WorkMapper', () => {
	const mapper = new WorkMapper();

	it('maps a work without relations to a book and no chapters', () => {
		expect(
			mapper.toEntity({
				doi: BOOK_DOI_URL,
				title: 'Solo',
				workType: 'TEXTBOOK',
			}),
		).toEqual({
			book: { doi: BOOK_DOI, title: 'Solo', type: 'TEXTBOOK', ordinal: 0 },
			chapters: [],
		});
	});

	it('always gives the book ordinal 0, whatever its relations say', () => {
		expect(mapper.toEntity(workWithChapters).book.ordinal).toBe(0);
	});

	it('keeps relation order and ordinals exactly as received (no sorting, no renumbering)', () => {
		const [first, second] = workWithChapters.relations ?? [];
		const unsorted = {
			...workWithChapters,
			relations: [
				{ ...second, relationOrdinal: 7 },
				{ ...first, relationOrdinal: 3 },
			],
		};

		const { chapters } = mapper.toEntity(unsorted);

		expect(chapters.map(({ doi, ordinal }) => [doi, ordinal])).toEqual([
			[CHAPTER_2_DOI, 7],
			[CHAPTER_1_DOI, 3],
		]);
	});

	it.each([
		['https://doi.org/10.11647/test.0001', '10.11647/test.0001'],
		['http://dx.doi.org/10.11647/test.0001', '10.11647/test.0001'],
		['doi:10.11647/test.0001', '10.11647/test.0001'],
		['10.11647/test.0001', '10.11647/test.0001'],
		// Case is preserved by normalization.
		['https://doi.org/10.11647/TEST.0001', '10.11647/TEST.0001'],
	])('normalizes the DOI %s to %s', (input, expected) => {
		const { book, chapters } = mapper.toEntity({
			doi: input,
			title: 't',
			workType: 'MONOGRAPH',
			relations: [
				{
					relationOrdinal: 1,
					relatedWork: { doi: input, title: 'c', workType: 'BOOK_CHAPTER' },
				},
			],
		});

		expect(book.doi).toBe(expected);
		expect(chapters[0].doi).toBe(expected);
	});

	it('maps an invalid or missing DOI to an empty string instead of throwing', () => {
		const { book, chapters } = mapper.toEntity({
			doi: 'not-a-doi',
			title: 't',
			workType: 'MONOGRAPH',
			relations: [
				{
					relationOrdinal: 1,
					relatedWork: {
						doi: null as unknown as string,
						title: 'c',
						workType: 'BOOK_CHAPTER',
					},
				},
			],
		});

		expect(book.doi).toBe('');
		expect(chapters[0].doi).toBe('');
	});

	it('throws when relations is null (only undefined falls back to [])', () => {
		expect(() =>
			mapper.toEntity({
				doi: BOOK_DOI_URL,
				title: 't',
				workType: 'MONOGRAPH',
				relations: null as unknown as undefined,
			}),
		).toThrow(TypeError);
	});
});
