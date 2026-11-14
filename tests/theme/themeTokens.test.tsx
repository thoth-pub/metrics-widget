import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { MetricsWidgetTheme } from '@/shared/interfaces';
import { ThemeProvider } from '@/shared/providers';
import { assignPlatformColors } from '@/shared/utils';

// jsdom does not compute cascaded fonts, so the stylesheet text is asserted instead.
const indexCss = readFileSync(
	resolve(__dirname, '../../src/index.css'),
	'utf8',
);

const root = () => document.documentElement;
const rootVar = (token: string) => root().style.getPropertyValue(`--${token}`);

const mountTheme = (theme: MetricsWidgetTheme) =>
	render(
		<ThemeProvider theme={theme}>
			<span />
		</ThemeProvider>,
	);

describe('font and heading-case tokens in the theme prop', () => {
	it('writes mw-font-heading and mw-font-body as given', () => {
		mountTheme({
			'mw-font-heading': '"Lato", sans-serif',
			'mw-font-body': '"Merriweather", Georgia, serif',
		});

		expect(rootVar('mw-font-heading')).toBe('"Lato", sans-serif');
		expect(rootVar('mw-font-body')).toBe('"Merriweather", Georgia, serif');
	});

	it('writes mw-heading-text-transform as given', () => {
		mountTheme({ 'mw-heading-text-transform': 'none' });

		expect(rootVar('mw-heading-text-transform')).toBe('none');
	});

	it('removes them again on unmount', () => {
		const { unmount } = mountTheme({
			'mw-font-heading': 'Lato',
			'mw-font-body': 'Lato',
			'mw-heading-text-transform': 'capitalize',
		});

		unmount();

		expect(rootVar('mw-font-heading')).toBe('');
		expect(rootVar('mw-font-body')).toBe('');
		expect(rootVar('mw-heading-text-transform')).toBe('');
	});
});

describe('src/index.css font wiring', () => {
	const declaration = (name: string) =>
		new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(indexCss)?.[1]?.trim();
	const economicaRule = /\n\.economica\s*\{([^}]*)\}/.exec(indexCss)?.[1] ?? '';

	it('defaults the new tokens through the old names', () => {
		expect(declaration('--mw-font-heading')).toBe('var(--mw-font-economica)');
		expect(declaration('--mw-font-body')).toBe('var(--mw-font-open-sans)');
		expect(declaration('--mw-heading-text-transform')).toBe('uppercase');
		expect(declaration('--mw-font-economica')).toBe('"Economica", sans-serif');
		expect(declaration('--mw-font-open-sans')).toBe('"Open Sans", sans-serif');
	});

	it('bridges the Tailwind font families through the new tokens', () => {
		expect(declaration('--font-economica')).toBe('var(--mw-font-heading)');
		expect(declaration('--font-open-sans')).toBe('var(--mw-font-body)');
	});

	it('sets font family and case of .economica through the new tokens', () => {
		expect(economicaRule).toMatch(/font-family:\s*var\(--mw-font-heading\)/);
		expect(economicaRule).toMatch(
			/text-transform:\s*var\(--mw-heading-text-transform\)/,
		);
		expect(economicaRule).not.toMatch(/\buppercase\b/);
		expect(economicaRule).not.toMatch(/--mw-font-economica/);
	});

	it('leaves no other font family or case set outside the tokens', () => {
		const withoutDefinitions = indexCss
			.replace(/@font-face\s*\{[^}]*\}/g, '')
			.split('\n')
			.filter((line) => /font-family|text-transform|uppercase/.test(line));

		expect(withoutDefinitions.map((line) => line.trim())).toEqual([
			'--mw-heading-text-transform: uppercase;',
			'font-family: var(--mw-font-heading);',
			'text-transform: var(--mw-heading-text-transform);',
		]);
	});
});

describe('platform colours for Thoth codes with underscores', () => {
	const platforms = [
		{
			platformId: 'p1',
			code: 'publisher_website',
			displayName: 'Publisher site',
		},
	];

	it('takes a theme key named by the slug of the code', () => {
		const colors = assignPlatformColors(platforms, {
			'mw-chart-metric-publisher-website': '#123456',
		});

		expect(colors.get('p1')).toEqual({
			token: 'mw-chart-metric-publisher-website',
			color: '#123456',
		});
	});

	it('takes a root CSS variable named by the slug of the code', () => {
		root().style.setProperty('--mw-chart-metric-publisher-website', '#654321');

		const colors = assignPlatformColors(platforms);

		expect(colors.get('p1')).toEqual({
			token: 'mw-chart-metric-publisher-website',
			color: '#654321',
		});
	});

	it('writes such a key through the theme prop as a colour', () => {
		mountTheme({ 'mw-chart-metric-publisher-website': '#123456' });

		expect(rootVar('mw-chart-metric-publisher-website')).toBe('#123456');
		expect(assignPlatformColors(platforms).get('p1')?.color).toBe('#123456');
	});
});
