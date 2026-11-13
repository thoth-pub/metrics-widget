import { scaleLinear } from 'd3-scale';
import type { MetricsWidgetTheme } from '../interfaces';

const METRIC_COLOR_VAR_PREFIX = '--mw-chart-metric-';
const METRIC_DEFAULT_COLOR_VAR = '--mw-chart-metric-default';
const MAP_ZERO_COLOR_VAR = '--mw-chart-map-zero';
const MAP_LOWEST_COLOR_VAR = '--mw-chart-map-lowest';
const MAP_HIGHEST_COLOR_VAR = '--mw-chart-map-highest';

const slugifySource = (source: string) =>
	source
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const resolveCssVar = (varName: string): string => {
	if (typeof window === 'undefined') return '';

	return getComputedStyle(document.documentElement)
		.getPropertyValue(varName)
		.trim();
};

const stripVarPrefix = (cssVarName: string) =>
	cssVarName.startsWith('--') ? cssVarName.slice(2) : cssVarName;

const themeOverride = (cssVarName: string, theme?: MetricsWidgetTheme | null) =>
	theme?.[stripVarPrefix(cssVarName) as keyof MetricsWidgetTheme];

export const getColor = (source: string, theme?: MetricsWidgetTheme | null) => {
	const slug = slugifySource(source);
	const platformVar = `${METRIC_COLOR_VAR_PREFIX}${slug}`;

	const platformOverride = themeOverride(platformVar, theme);

	if (platformOverride) return platformOverride;

	const resolved = resolveCssVar(platformVar);

	if (resolved) return resolved;

	const defaultOverride = themeOverride(METRIC_DEFAULT_COLOR_VAR, theme);
	
  if (defaultOverride) return defaultOverride;

	return resolveCssVar(METRIC_DEFAULT_COLOR_VAR);
};

/** Platforms without a token of their own take these existing tokens, in order (cycling). */
export const FALLBACK_METRIC_COLOR_TOKENS = [
	'mw-chart-metric-default',
	'mw-chart-metric-wikimedia',
	'mw-chart-metric-crossref',
	'mw-chart-metric-oapen',
	'mw-chart-metric-open-book-publishers',
	'mw-chart-metric-wordpress-com',
	'mw-chart-metric-twitter',
] as const;

export type PlatformColor = { token: string; color: string };

type ColorPlatform = {
	platformId: string;
	code: string;
	displayName: string;
};

const tokenColor = (token: string, theme?: MetricsWidgetTheme | null) =>
	themeOverride(token, theme) || resolveCssVar(`--${token}`);

/** A token "exists" when the theme overrides it or the stylesheet gives it a non-empty value. */
const hasToken = (token: string, theme?: MetricsWidgetTheme | null) =>
	Boolean(themeOverride(token, theme)) || resolveCssVar(`--${token}`) !== '';

const ownToken = (
	platform: ColorPlatform,
	theme?: MetricsWidgetTheme | null,
) =>
	[platform.code, platform.displayName]
		.map(slugifySource)
		.filter((slug) => slug.length > 0)
		.map((slug) => `${METRIC_COLOR_VAR_PREFIX.slice(2)}${slug}`)
		.find((token) => hasToken(token, theme));

/**
 * Colours the platforms of one read (WIDGET-02 specification section 7.1.2). A platform whose `code` slug, else
 * `displayName` slug, has a `mw-chart-metric-<slug>` token uses it. Every other platform takes, in platform order
 * (display name, then ID), the next fallback token, skipping any whose value equals the colour of a platform with
 * its own token in the same read; if that would skip every fallback, they are used in order without skipping.
 */
export const assignPlatformColors = (
	platforms: ColorPlatform[],
	theme?: MetricsWidgetTheme | null,
): Map<string, PlatformColor> => {
	const colors = new Map<string, PlatformColor>();
	const ordered = [...platforms].sort(
		(a, b) =>
			a.displayName.localeCompare(b.displayName, 'en') ||
			(a.platformId < b.platformId ? -1 : a.platformId > b.platformId ? 1 : 0),
	);
	const tokenless: ColorPlatform[] = [];

	for (const platform of ordered) {
		const token = ownToken(platform, theme);

		if (token) {
			colors.set(platform.platformId, {
				token,
				color: tokenColor(token, theme),
			});
		} else {
			tokenless.push(platform);
		}
	}

	const ownColors = new Set([...colors.values()].map(({ color }) => color));
	const available = FALLBACK_METRIC_COLOR_TOKENS.filter(
		(token) => !ownColors.has(tokenColor(token, theme)),
	);
	const fallbacks =
		available.length > 0 ? available : [...FALLBACK_METRIC_COLOR_TOKENS];

	tokenless.forEach((platform, index) => {
		const token = fallbacks[index % fallbacks.length];

		colors.set(platform.platformId, { token, color: tokenColor(token, theme) });
	});

	return colors;
};

export const isChapter = (workType: string) => {
	return workType === 'BOOK_CHAPTER';
};

export const roundPercentage = (percentage: number) => {
	return percentage.toFixed(2).replace('.00', '');
};

export const getPercentage = (totalMetrics: number, totalCount: number) => {
	if (totalCount === 0) return 0;

	return (totalMetrics / totalCount) * 100;
};

export const getSaturationValue = ({
	topValue,
	itemValue,
}: {
	topValue: number;
	itemValue: number;
}) => {
	if (topValue === 0) return 0;

	const filterValue = (itemValue * 100) / topValue;

	return filterValue;
};

const resolveMapColor = (cssVarName: string, theme?: MetricsWidgetTheme | null) =>
	themeOverride(cssVarName, theme) ?? resolveCssVar(cssVarName);

export const getChartColorByPercentage = ({
	highestValue,
	lowestValue,
	theme,
}: {
	highestValue: number;
	lowestValue: number;
	theme?: MetricsWidgetTheme | null;
}) => {
	if (lowestValue === 0) return resolveMapColor(MAP_ZERO_COLOR_VAR, theme);

	const percentage = getSaturationValue({
		topValue: highestValue,
		itemValue: lowestValue,
	});
	const colorScale = scaleLinear()
		.domain([0, 100])
		// @ts-expect-error d3-scale types issue
		.range([
			resolveMapColor(MAP_LOWEST_COLOR_VAR, theme),
			resolveMapColor(MAP_HIGHEST_COLOR_VAR, theme),
		]);

	const color = colorScale(percentage);

	return color.toString();
};

export const convertShortMonthToLongMonth = (month: string) => {
	switch (month.toLowerCase()) {
		case 'jan':
			return 'January';
		case 'feb':
			return 'February';
		case 'mar':
			return 'March';
		case 'apr':
			return 'April';
		case 'may':
			return 'May';
		case 'jun':
			return 'June';
		case 'jul':
			return 'July';
		case 'aug':
			return 'August';
		case 'sep':
			return 'September';
		case 'oct':
			return 'October';
		case 'nov':
			return 'November';
		case 'dec':
			return 'December';
		default:
			return month;
	}
};
