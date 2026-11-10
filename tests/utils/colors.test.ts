import { isValidColor } from '@/shared/utils';
import { describe, expect, it } from 'vitest';

describe('isValidColor', () => {
	it.each([
		['red', true],
		['rgb(1, 2, 3)', true],
		['hsl(120, 50%, 50%)', true],
		['notacolor', false],
		['', false],
	])('%j -> %s', (color, expected) => {
		expect(isValidColor(color)).toBe(expected);
	});

	it('accepts hex colors', () => {
		expect(isValidColor('#ff0000')).toBe(true);
	});
});
