import {
	convertMonthToKey,
	convertShortMonthToLongMonth,
	getAlignedCountryName,
	getApiCountryName,
	getChartColorByPercentage,
	getColor,
	getContinentNameByCode,
	getIncludedSources,
	getPercentage,
	getSaturationValue,
	isChapter,
	resolveCssVar,
	roundPercentage,
	updateSource,
} from '@/shared/utils';
import { describe, expect, it } from 'vitest';

describe('updateSource', () => {
	it.each([
		['Open Book Publishers', 'OBP'],
		['Open Book Publishers HTML Reader', 'OBP HTML Reader'],
		['Open Book Publishers PDF Reader', 'OBP PDF Reader'],
		['Google Books', 'Google Books'],
		['OAPEN', 'OAPEN'],
		['', ''],
	])('maps %j to %j', (source, expected) => {
		expect(updateSource(source)).toBe(expected);
	});

	it('only rewrites a matching prefix and keeps the rest of the name', () => {
		expect(updateSource('Open Book Publishers Podcast')).toBe('OBP Podcast');
	});

	it('is case sensitive and does not match in the middle of a name', () => {
		expect(updateSource('open book publishers')).toBe('open book publishers');
		expect(updateSource('The Open Book Publishers')).toBe(
			'The Open Book Publishers',
		);
	});

	it('leaves names that already use the short label unchanged', () => {
		expect(updateSource('OBP')).toBe('OBP');
	});
});

describe('getAlignedCountryName', () => {
	it.each([
		["Cote d'Ivoire Ivory Coast", "Côte d'Ivoire"],
		['Czech Republic', 'Czechia'],
		['United Kingdom', 'United Kingdom of Great Britain and Northern Ireland'],
		['South Korea', 'Republic of Korea'],
		['North Korea', "Democratic People's Republic of Korea"],
		['Moldava', 'Moldova'],
		['Myanmar Burma', 'Myanmar'],
		['Phillipines', 'Philippines'],
		['Russia', 'Russian Federation'],
		['Syria', 'Syrian Arab Republic'],
		['Turkey', 'Türkiye'],
		['Vietnam', 'Viet Nam'],
	])('special case %j -> %j', (name, expected) => {
		expect(getAlignedCountryName(name)).toBe(expected);
	});

	it('matches the special cases case-insensitively', () => {
		expect(getAlignedCountryName('RUSSIA')).toBe('Russian Federation');
		expect(getAlignedCountryName('vietnam')).toBe('Viet Nam');
		expect(getAlignedCountryName("COTE D'IVOIRE IVORY COAST")).toBe(
			"Côte d'Ivoire",
		);
	});

	it('resolves other names through the ISO 3166-1 list (case-insensitive, canonical casing)', () => {
		expect(getAlignedCountryName('Germany')).toBe('Germany');
		expect(getAlignedCountryName('france')).toBe('France');
		expect(getAlignedCountryName('United States of America')).toBe(
			'United States of America',
		);
	});

	it('returns names unknown to ISO unchanged, including common short names', () => {
		expect(getAlignedCountryName('Narnia')).toBe('Narnia');
		expect(getAlignedCountryName('')).toBe('');
		// Not an official ISO name, so it is not aligned to the map's naming.
		expect(getAlignedCountryName('United States')).toBe('United States');
		expect(getAlignedCountryName('Iran')).toBe('Iran');
	});
});

describe('getApiCountryName', () => {
	it.each([
		["Côte d'Ivoire", "Cote d'ivoire Ivory Coast"],
		['Czechia', 'Czech Republic'],
		['United Kingdom of Great Britain and Northern Ireland', 'United Kingdom'],
		['Republic of Korea', 'South Korea'],
		["Democratic People's Republic of Korea", 'North Korea'],
		['Moldova', 'Moldava'],
		['Myanmar', 'Myanmar Burma'],
		['Philippines', 'Phillipines'],
		['Russian Federation', 'Russia'],
		['Syrian Arab Republic', 'Syria'],
		['Türkiye', 'Turkey'],
		['Viet Nam', 'Vietnam'],
		['Germany', 'Germany'],
	])('%j -> %j', (name, expected) => {
		expect(getApiCountryName(name)).toBe(expected);
	});

	it('is case-insensitive on input but returns unknown names untouched', () => {
		expect(getApiCountryName('CZECHIA')).toBe('Czech Republic');
		expect(getApiCountryName('germany')).toBe('germany');
	});
});

describe('getContinentNameByCode', () => {
	it.each([
		['AF', 'Africa'],
		['AS', 'Asia'],
		['EU', 'Europe'],
		['NA', 'Northern America'],
		['AN', 'Antarctica'],
		['SA', 'Latin America and the Caribbean'],
		['LA', 'Latin America and the Caribbean'],
		['OC', 'Oceania'],
	])('%s -> %s', (code, expected) => {
		expect(getContinentNameByCode(code)).toBe(expected);
	});

	it('is case-insensitive', () => {
		expect(getContinentNameByCode('eu')).toBe('Europe');
		expect(getContinentNameByCode('Oc')).toBe('Oceania');
	});

	it('returns unknown codes unchanged', () => {
		expect(getContinentNameByCode('XX')).toBe('XX');
		expect(getContinentNameByCode('')).toBe('');
	});
});

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
		['01', 'Jan'],
		['02', 'Feb'],
		['03', 'Mar'],
		['04', 'Apr'],
		['05', 'May'],
		['06', 'Jun'],
		['07', 'Jul'],
		['08', 'Aug'],
		['09', 'Sep'],
		['10', 'Oct'],
		['11', 'Nov'],
		['12', 'Dec'],
	])('convertMonthToKey(%s) -> %s', (month, key) => {
		expect(convertMonthToKey(month)).toBe(key);
	});

	it('convertMonthToKey only understands zero-padded months and returns the rest unchanged', () => {
		expect(convertMonthToKey('1')).toBe('1');
		expect(convertMonthToKey('13')).toBe('13');
		expect(convertMonthToKey('2024-01')).toBe('2024-01');
		expect(convertMonthToKey('')).toBe('');
	});

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

describe('getIncludedSources', () => {
	const options = [
		{ label: 'A', value: 'a' },
		{ label: 'B', value: 'b', disabled: true },
		{ label: 'C', value: 'c' },
	];

	it('returns the values of the enabled options when nothing is selected', () => {
		expect(getIncludedSources([], options)).toEqual(['a', 'c']);
	});

	it('returns the selected values when something is selected', () => {
		expect(getIncludedSources([options[2]], options)).toEqual(['c']);
	});

	it('keeps a selected option even if it is disabled', () => {
		expect(getIncludedSources([options[1]], options)).toEqual(['b']);
	});

	it('returns an empty list when there are no options', () => {
		expect(getIncludedSources([], [])).toEqual([]);
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
