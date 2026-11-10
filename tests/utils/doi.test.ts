import { buildDoiUrl, isValidDoi, normalizeDoi } from '@/shared/utils';
import { describe, expect, it } from 'vitest';

describe('isValidDoi', () => {
	it.each([
		['10.11647/obp.0001', true],
		['10.11647/obp.0001.01', true],
		['https://doi.org/10.11647/OBP.0001', true],
		['http://dx.doi.org/10.11647/obp.0001', true],
		['doi:10.11647/obp.0001', true],
		['abc', false],
		['', false],
		['10.11647/obp.0001 ', false],
		['DOI: 10.1/x', false],
	])('%j -> %s', (doi, expected) => {
		expect(isValidDoi(doi)).toBe(expected);
	});
});

describe('normalizeDoi', () => {
	it('strips resolver prefixes and keeps the bare DOI', () => {
		expect(normalizeDoi('https://doi.org/10.11647/obp.0001')).toBe(
			'10.11647/obp.0001',
		);
		expect(normalizeDoi('http://dx.doi.org/10.11647/obp.0001')).toBe(
			'10.11647/obp.0001',
		);
		expect(normalizeDoi('doi:10.11647/obp.0001')).toBe('10.11647/obp.0001');
	});

	it('preserves the case of the DOI', () => {
		expect(normalizeDoi('https://doi.org/10.11647/OBP.0001')).toBe(
			'10.11647/OBP.0001',
		);
	});

	it('drops a query string', () => {
		expect(normalizeDoi('https://doi.org/10.1/x?y')).toBe('10.1/x');
	});

	it('returns an empty string for invalid input', () => {
		expect(normalizeDoi('abc')).toBe('');
		expect(normalizeDoi('')).toBe('');
		expect(normalizeDoi(' 10.11647/obp.0001')).toBe('');
	});
});

describe('buildDoiUrl', () => {
	it('builds a https://doi.org URL from any valid form', () => {
		expect(buildDoiUrl('10.11647/obp.0001')).toBe(
			'https://doi.org/10.11647/obp.0001',
		);
		expect(buildDoiUrl('doi:10.11647/obp.0001')).toBe(
			'https://doi.org/10.11647/obp.0001',
		);
		expect(buildDoiUrl('http://dx.doi.org/10.11647/obp.0001')).toBe(
			'https://doi.org/10.11647/obp.0001',
		);
	});

	it('returns an empty string for invalid input', () => {
		expect(buildDoiUrl('abc')).toBe('');
		expect(buildDoiUrl('')).toBe('');
	});
});
