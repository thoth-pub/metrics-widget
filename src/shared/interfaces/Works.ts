import type { Doi } from './Doi';

export const WorkTypes = {
	BookChapter: 'BOOK_CHAPTER',
	BookSet: 'BOOK_SET',
	EditedBook: 'EDITED_BOOK',
	JournalIssue: 'JOURNAL_ISSUE',
	Monograph: 'MONOGRAPH',
	Textbook: 'TEXTBOOK',
};

export type WorkType = (typeof WorkTypes)[keyof typeof WorkTypes];

export type WorkDto = {
	doi: Doi;
	title: string;
	workType: WorkType;
	relations?: {
		relationOrdinal?: number;
	}[];
};

export type WorkEntity = {
	doi: Doi;
	title: string;
	type: WorkType;
	ordinal: number;
};
