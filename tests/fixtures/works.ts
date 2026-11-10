import type { WorkDto } from '@/shared/interfaces';

/** Thoth returns DOIs as full https://doi.org URLs. */
export const BOOK_DOI_URL = 'https://doi.org/10.11647/test.0001';
export const BOOK_DOI = '10.11647/test.0001';
export const CHAPTER_1_DOI = '10.11647/test.0001.01';
export const CHAPTER_2_DOI = '10.11647/test.0001.02';

export const workWithChapters: WorkDto = {
	doi: BOOK_DOI_URL,
	title: 'A Test Book',
	workType: 'MONOGRAPH',
	relations: [
		{
			relationOrdinal: 1,
			relatedWork: {
				doi: `https://doi.org/${CHAPTER_1_DOI}`,
				title: 'Chapter One',
				workType: 'BOOK_CHAPTER',
			},
		},
		{
			relationOrdinal: 2,
			relatedWork: {
				doi: `https://doi.org/${CHAPTER_2_DOI}`,
				title: 'Chapter Two',
				workType: 'BOOK_CHAPTER',
			},
		},
	],
};

/** A DOI that resolves to a chapter that is itself the "main work". */
export const CHAPTER_AS_WORK_DOI_URL = 'https://doi.org/10.11647/test.0002.01';
export const CHAPTER_AS_WORK_DOI = '10.11647/test.0002.01';

export const chapterAsMainWork: WorkDto = {
	doi: CHAPTER_AS_WORK_DOI_URL,
	title: 'A Lone Chapter',
	workType: 'BOOK_CHAPTER',
	relations: [],
};
