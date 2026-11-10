import { getYearDateRange } from '@/shared/utils';
import { describe, expect, it, vi } from 'vitest';

describe('getYearDateRange', () => {
	it('spans 1 January of the year to 1 January of the next year (exclusive end)', () => {
		expect(getYearDateRange('2024')).toEqual({
			startDate: '2024-01-01',
			endDate: '2025-01-01',
		});
	});

	it('crosses the century boundary', () => {
		expect(getYearDateRange('1999')).toEqual({
			startDate: '1999-01-01',
			endDate: '2000-01-01',
		});
	});

	it('defaults to the current year', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2030-06-15T12:00:00Z'));

		expect(getYearDateRange()).toEqual({
			startDate: '2030-01-01',
			endDate: '2031-01-01',
		});
	});

	it('does not zero-pad years below 1000', () => {
		expect(getYearDateRange('0999')).toEqual({
			startDate: '999-01-01',
			endDate: '1000-01-01',
		});
	});

	it('does not validate input: a non-numeric year yields NaN dates', () => {
		expect(getYearDateRange('abc')).toEqual({
			startDate: 'NaN-01-01',
			endDate: 'NaN-01-01',
		});
	});
});
