import { describe, expect, it } from 'vitest';
import {
	assignPlatformColors,
	FALLBACK_METRIC_COLOR_TOKENS,
} from '@/shared/utils';

const setVar = (token: string, value: string) =>
	document.documentElement.style.setProperty(`--${token}`, value);

const platform = (platformId: string, displayName: string, code = '') => ({
	platformId,
	code,
	displayName,
});

const tokens = (colors: ReturnType<typeof assignPlatformColors>) =>
	Object.fromEntries(
		[...colors.entries()].map(([id, { token }]) => [id, token]),
	);

describe('assignPlatformColors', () => {
	it('uses the token of the code slug, else of the display name slug', () => {
		setVar('mw-chart-metric-oapen', '#5fb0d3');
		setVar('mw-chart-metric-open-book-publishers', '#8da0f1');

		const colors = assignPlatformColors([
			platform('a', 'OAPEN Library', 'oapen'),
			platform('b', 'Open Book Publishers', 'obp_web'),
		]);

		expect(colors.get('a')).toEqual({
			token: 'mw-chart-metric-oapen',
			color: '#5fb0d3',
		});
		expect(colors.get('b')).toEqual({
			token: 'mw-chart-metric-open-book-publishers',
			color: '#8da0f1',
		});
	});

	it('counts a theme override alone as a token', () => {
		const colors = assignPlatformColors([platform('a', 'Zenodo', 'zenodo')], {
			'mw-chart-metric-zenodo': 'red',
		} as never);

		expect(colors.get('a')).toEqual({
			token: 'mw-chart-metric-zenodo',
			color: 'red',
		});
	});

	it('gives platforms without a token the fixed list in platform order, skipping a value already used by an own token', () => {
		setVar('mw-chart-metric-oapen', '#5fb0d3');
		setVar('mw-chart-metric-default', '#5b65cf');
		setVar('mw-chart-metric-wikimedia', '#db6a6a');
		setVar('mw-chart-metric-crossref', '#52a46b');
		// The fourth fallback has the same value as OAPEN's own token, so it is skipped.

		const colors = assignPlatformColors([
			platform('z', 'Zeta'),
			platform('o', 'OAPEN', 'oapen'),
			platform('a', 'Alpha'),
			platform('b', 'Beta'),
			platform('c', 'Gamma'),
			platform('d', 'Delta'),
		]);

		expect(tokens(colors)).toEqual({
			o: 'mw-chart-metric-oapen',
			a: 'mw-chart-metric-default',
			b: 'mw-chart-metric-wikimedia',
			d: 'mw-chart-metric-crossref',
			c: 'mw-chart-metric-open-book-publishers',
			z: 'mw-chart-metric-wordpress-com',
		});
	});

	it('orders platforms by display name, then platform ID, and cycles the list', () => {
		const platforms = Array.from({ length: 9 }, (_, index) =>
			platform(`id-${9 - index}`, 'Same'),
		);
		const colors = assignPlatformColors(platforms);

		expect(colors.get('id-1')?.token).toBe(FALLBACK_METRIC_COLOR_TOKENS[0]);
		expect(colors.get('id-7')?.token).toBe(FALLBACK_METRIC_COLOR_TOKENS[6]);
		expect(colors.get('id-8')?.token).toBe(FALLBACK_METRIC_COLOR_TOKENS[0]);
	});

	it('still colours every platform when a theme gives every listed token the same value', () => {
		const theme = Object.fromEntries(
			[...FALLBACK_METRIC_COLOR_TOKENS, 'mw-chart-metric-oapen'].map(
				(token) => [token, '#000000'],
			),
		);
		const colors = assignPlatformColors(
			[
				platform('o', 'OAPEN', 'oapen'),
				platform('a', 'Alpha'),
				platform('b', 'Beta'),
			],
			theme as never,
		);

		expect(tokens(colors)).toEqual({
			o: 'mw-chart-metric-oapen',
			a: 'mw-chart-metric-default',
			b: 'mw-chart-metric-wikimedia',
		});
	});
});
