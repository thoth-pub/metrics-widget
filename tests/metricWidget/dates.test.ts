import { describe, expect, it } from 'vitest';
import {
	metricWidgetEndDate,
	monthBuckets,
	monthViewCaption,
	periodCaption,
	yearBucketLabel,
	yearBuckets,
} from '@/shared/metricWidget';

const lastLabel = (startDate: string, endDate: string) => {
	const buckets = yearBuckets(startDate, endDate);

	return yearBucketLabel(buckets[buckets.length - 1]);
};

describe('E (end date, choice E2)', () => {
	it.each([
		['2026-11-13T12:00:00Z', '2026-12-01', '2026 (Jan–Nov)'],
		['2026-12-15T12:00:00Z', '2027-01-01', '2026'],
		['2027-01-05T12:00:00Z', '2027-02-01', '2027 (Jan)'],
	])('at %s, E is %s and the last bucket is %s', (now, end, label) => {
		const endDate = metricWidgetEndDate(new Date(now));

		expect(endDate).toBe(end);
		expect(lastLabel('2019-03-01', endDate)).toBe(label);
	});

	it('follows UTC, not a local time zone ahead of UTC across a month boundary', () => {
		// 2026-12-01T00:30 in UTC+02:00 is still 30 November in UTC.
		const now = new Date('2026-11-30T22:30:00Z');

		expect(metricWidgetEndDate(now)).toBe('2026-12-01');
		expect(metricWidgetEndDate(new Date('2026-12-01T01:30:00+02:00'))).toBe(
			'2026-12-01',
		);
	});

	it('is at most 31 days after today', () => {
		const now = new Date('2026-01-01T00:00:00Z');
		const days =
			(Date.parse(`${metricWidgetEndDate(now)}T00:00:00Z`) - now.getTime()) /
			86_400_000;

		expect(days).toBeLessThanOrEqual(31);
	});
});

describe('YEAR buckets and labels', () => {
	it('splits the served range at each 1 January', () => {
		expect(yearBuckets('2024-03-01', '2026-12-01')).toEqual([
			{ startDate: '2024-03-01', endDate: '2025-01-01' },
			{ startDate: '2025-01-01', endDate: '2026-01-01' },
			{ startDate: '2026-01-01', endDate: '2026-12-01' },
		]);
	});

	it.each([
		[{ startDate: '2024-01-01', endDate: '2025-01-01' }, '2024'],
		[{ startDate: '2019-03-01', endDate: '2020-01-01' }, '2019 (Mar–Dec)'],
		[{ startDate: '2026-01-01', endDate: '2026-12-01' }, '2026 (Jan–Nov)'],
		[{ startDate: '2027-01-01', endDate: '2027-02-01' }, '2027 (Jan)'],
		[{ startDate: '2019-12-01', endDate: '2020-01-01' }, '2019 (Dec)'],
		[{ startDate: '2019-07-01', endDate: '2019-10-01' }, '2019 (Jul–Sep)'],
	])('labels %j as %s', (bucket, label) => {
		expect(yearBucketLabel(bucket)).toBe(label);
	});

	it('starts the first bucket at a mid-year served start', () => {
		const [first] = yearBuckets('2021-07-01', '2026-12-01');

		expect(first).toEqual({ startDate: '2021-07-01', endDate: '2022-01-01' });
		expect(yearBucketLabel(first)).toBe('2021 (Jul–Dec)');
	});
});

describe('MONTH buckets (R-MONTH of one year)', () => {
	it('covers a first part-year bucket from the served start', () => {
		expect(
			monthBuckets('2019-03-01', '2020-01-01').map((m) => m.startDate),
		).toEqual([
			'2019-03-01',
			'2019-04-01',
			'2019-05-01',
			'2019-06-01',
			'2019-07-01',
			'2019-08-01',
			'2019-09-01',
			'2019-10-01',
			'2019-11-01',
			'2019-12-01',
		]);
	});

	it('covers a last part-year bucket up to E', () => {
		const months = monthBuckets('2026-01-01', '2026-12-01');

		expect(months).toHaveLength(11);
		expect(months[10]).toEqual({
			startDate: '2026-11-01',
			endDate: '2026-12-01',
		});
	});
});

describe('captions', () => {
	it('states the period read, ending at the current month', () => {
		expect(
			periodCaption({ startDate: '2019-03-01', endDate: '2026-12-01' }),
		).toBe('Mar 2019 – Nov 2026');
	});

	it('names the open year in the month view', () => {
		expect(
			monthViewCaption({ startDate: '2026-01-01', endDate: '2026-12-01' }),
		).toBe('2026 (Jan–Nov) by month');
	});
});
