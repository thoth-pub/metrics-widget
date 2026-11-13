// Calendar helpers for `metricWidget` reads. Dates are ISO `YYYY-MM-DD` strings in UTC; ranges are
// [startDate, endDate) with an exclusive end, as the contract defines them.

export const MONTH_NAMES = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
] as const;

export type DateRange = { startDate: string; endDate: string };

const FIRST_OF_MONTH = /^(\d{4})-(0[1-9]|1[0-2])-01$/;

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

export const isFirstOfMonth = (date: string) => FIRST_OF_MONTH.test(date);

const yearOf = (date: string) => Number(date.slice(0, 4));

/** 1 to 12. */
const monthOf = (date: string) => Number(date.slice(5, 7));

const firstOfMonth = (year: number, month: number) =>
	`${pad(year, 4)}-${pad(month)}-01`;

/** The first day of the month `count` months after the month of `date` (a first of a month). */
export const addMonths = (date: string, count: number) => {
	const index = yearOf(date) * 12 + (monthOf(date) - 1) + count;

	return firstOfMonth(Math.floor(index / 12), (index % 12) + 1);
};

/**
 * `E`, the exclusive end of every read (choice E2): the first day of the month after the current month, in UTC
 * from the client clock, so the current month is included.
 */
export const metricWidgetEndDate = (now: Date) =>
	addMonths(firstOfMonth(now.getUTCFullYear(), now.getUTCMonth() + 1), 1);

/** `YEAR` buckets: from `startDate` to `endDate`, split at each 1 January. */
export const yearBuckets = (startDate: string, endDate: string): DateRange[] => {
	const buckets: DateRange[] = [];
	let cursor = startDate;

	while (cursor < endDate) {
		const nextYear = `${pad(yearOf(cursor) + 1, 4)}-01-01`;
		const next = nextYear < endDate ? nextYear : endDate;

		buckets.push({ startDate: cursor, endDate: next });
		cursor = next;
	}

	return buckets;
};

/** `MONTH` buckets: each calendar month of [startDate, endDate), both first days of months. */
export const monthBuckets = (
	startDate: string,
	endDate: string,
): DateRange[] => {
	const buckets: DateRange[] = [];
	let cursor = startDate;

	while (cursor < endDate) {
		const next = addMonths(cursor, 1);

		buckets.push({ startDate: cursor, endDate: next });
		cursor = next;
	}

	return buckets;
};

export const monthName = (date: string) => MONTH_NAMES[monthOf(date) - 1];

/** The last month a range holds, as the first day of that month (`endDate` is exclusive). */
const lastMonthOf = ({ endDate }: DateRange) => addMonths(endDate, -1);

/**
 * A `YEAR` bucket label: `YYYY` for a whole calendar year, otherwise `YYYY (Mon–Mon)` with its first and last
 * month, or `YYYY (Mon)` for a one-month bucket.
 */
export const yearBucketLabel = (bucket: DateRange) => {
	const year = yearOf(bucket.startDate);

	if (
		bucket.startDate === `${pad(year, 4)}-01-01` &&
		bucket.endDate === `${pad(year + 1, 4)}-01-01`
	) {
		return String(year);
	}

	const first = monthName(bucket.startDate);
	const last = monthName(lastMonthOf(bucket));

	return first === last ? `${year} (${first})` : `${year} (${first}–${last})`;
};

const monthYear = (date: string) => `${monthName(date)} ${yearOf(date)}`;

/** The period a read covers: `<Mon YYYY> – <Mon YYYY>`, from its start to the month before its exclusive end. */
export const periodCaption = (range: DateRange) =>
	`${monthYear(range.startDate)} – ${monthYear(lastMonthOf(range))}`;

/** The month view caption: `<bucket label> by month`. */
export const monthViewCaption = (bucket: DateRange) =>
	`${yearBucketLabel(bucket)} by month`;

export const yearOfDate = yearOf;
