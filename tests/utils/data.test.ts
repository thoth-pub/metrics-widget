import {
	convertShortMonthToLongMonth,
	getChartColorByPercentage,
	getColor,
	getPercentage,
	getSaturationValue,
	isChapter,
	resolveCssVar,
	roundPercentage,
} from '@/shared/utils';
import { describe, expect, it } from 'vitest';

describe('getPercentage', () => {
	it('returns metrics / total as a percentage', () => {
		expect(getPercentage(1, 4)).toBe(25);
		expect(getPercentage(4, 4)).toBe(100);
		expect(getPercentage(0, 4)).toBe(0);
	});

	it('returns 0 when the total is 0 instead of dividing by zero', () => {
		expect(getPercentage(5, 0)).toBe(0);
		expect(getPercentage(0, 0)).toBe(0);
	});

	it('does not clamp values above 100', () => {
		expect(getPercentage(5, 4)).toBe(125);
	});

	it('does not round', () => {
		expect(getPercentage(1, 3)).toBeCloseTo(33.3333333, 5);
	});
});

describe('roundPercentage', () => {
	it.each([
		[12.5, '12.50'],
		[50, '50'],
		[100, '100'],
		[0, '0'],
		[33.333333, '33.33'],
		[66.666666, '66.67'],
		[99.999, '100'],
		[0.004, '0'],
		[0.005, '0.01'],
		[7.1, '7.10'],
	])('%d -> %s', (value, expected) => {
		expect(roundPercentage(value)).toBe(expected);
	});

	it('returns a string with trailing ".00" stripped but other trailing zeros kept', () => {
		expect(typeof roundPercentage(10)).toBe('string');
		expect(roundPercentage(10)).toBe('10');
		expect(roundPercentage(10.1)).toBe('10.10');
	});
});

describe('isChapter', () => {
	it('is true only for BOOK_CHAPTER', () => {
		expect(isChapter('BOOK_CHAPTER')).toBe(true);
		expect(isChapter('MONOGRAPH')).toBe(false);
		expect(isChapter('EDITED_BOOK')).toBe(false);
		expect(isChapter('')).toBe(false);
	});

	it('is case sensitive', () => {
		expect(isChapter('book_chapter')).toBe(false);
	});
});

describe('month helpers', () => {
	it.each([
		['Jan', 'January'],
		['Feb', 'February'],
		['Mar', 'March'],
		['Apr', 'April'],
		['May', 'May'],
		['Jun', 'June'],
		['Jul', 'July'],
		['Aug', 'August'],
		['Sep', 'September'],
		['Oct', 'October'],
		['Nov', 'November'],
		['Dec', 'December'],
	])('convertShortMonthToLongMonth(%s) -> %s', (short, long) => {
		expect(convertShortMonthToLongMonth(short)).toBe(long);
		expect(convertShortMonthToLongMonth(short.toUpperCase())).toBe(long);
	});

	it('convertShortMonthToLongMonth returns unknown input unchanged', () => {
		expect(convertShortMonthToLongMonth('Sept')).toBe('Sept');
	});
});

describe('getSaturationValue', () => {
	it('returns the item as a percentage of the top value', () => {
		expect(getSaturationValue({ topValue: 200, itemValue: 50 })).toBe(25);
	});

	it('returns 0 when the top value is 0', () => {
		expect(getSaturationValue({ topValue: 0, itemValue: 5 })).toBe(0);
	});
});

describe('CSS variable colors', () => {
	it('resolveCssVar reads and trims a custom property from the document root', () => {
		document.documentElement.style.setProperty('--mw-test', '  #123456 ');

		expect(resolveCssVar('--mw-test')).toBe('#123456');
	});

	it('resolveCssVar returns an empty string for an unset property', () => {
		expect(resolveCssVar('--mw-not-set')).toBe('');
	});

	describe('getColor', () => {
		it('prefers the theme override for the platform slug', () => {
			document.documentElement.style.setProperty(
				'--mw-chart-metric-google-books',
				'blue',
			);

			expect(
				getColor('Google Books', { 'mw-chart-metric-google-books': 'red' }),
			).toBe('red');
		});

		it('falls back to the CSS variable for the platform slug', () => {
			document.documentElement.style.setProperty(
				'--mw-chart-metric-google-books',
				'blue',
			);

			expect(getColor('Google Books', null)).toBe('blue');
		});

		it('slugifies the source: lower case, non-alphanumerics collapsed to "-", edges trimmed', () => {
			document.documentElement.style.setProperty(
				'--mw-chart-metric-open-book-publishers-html-reader',
				'green',
			);
			document.documentElement.style.setProperty(
				'--mw-chart-metric-wordpress-com',
				'teal',
			);

			expect(getColor('Open Book Publishers HTML Reader')).toBe('green');
			expect(getColor('  WordPress.com!! ')).toBe('teal');
		});

		it('falls back to the theme default, then to the CSS default variable', () => {
			document.documentElement.style.setProperty(
				'--mw-chart-metric-default',
				'gray',
			);

			expect(
				getColor('Unknown Platform', { 'mw-chart-metric-default': 'purple' }),
			).toBe('purple');
			expect(getColor('Unknown Platform', {})).toBe('gray');
		});

		it('returns an empty string when nothing is configured', () => {
			expect(getColor('Unknown Platform')).toBe('');
		});
	});

	describe('getChartColorByPercentage', () => {
		it('uses the zero color when the lowest value is 0', () => {
			expect(
				getChartColorByPercentage({
					highestValue: 10,
					lowestValue: 0,
					theme: { 'mw-chart-map-zero': 'rgb(1, 2, 3)' },
				}),
			).toBe('rgb(1, 2, 3)');
		});

		it('interpolates between the lowest and highest colors by saturation', () => {
			const theme = {
				'mw-chart-map-lowest': 'rgb(0, 0, 0)',
				'mw-chart-map-highest': 'rgb(100, 200, 50)',
			};

			expect(
				getChartColorByPercentage({ highestValue: 10, lowestValue: 10, theme }),
			).toBe('rgb(100, 200, 50)');
			expect(
				getChartColorByPercentage({ highestValue: 20, lowestValue: 10, theme }),
			).toBe('rgb(50, 100, 25)');
		});
	});
});
