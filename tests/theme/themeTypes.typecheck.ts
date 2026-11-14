// Type-level checks for the theme type. Not a test file itself: themeTypes.test.ts compiles it with the
// project's compiler options and expects no diagnostics, so a failed `@ts-expect-error` (TS2578) fails too.
import type { MetricsWidgetTheme } from '@/shared/interfaces';

export const valid: MetricsWidgetTheme = {
	'mw-chart-metric-publisher-website': '#123456',
	'mw-font-heading': 'Lato',
	'mw-font-body': '"Open Sans", sans-serif',
	'mw-heading-text-transform': 'none',
	'mw-chart-metric-google-books': '#ff8800',
};

export const misspelt: MetricsWidgetTheme = {
	// @ts-expect-error a misspelt token name must not compile
	'mw-colour-background': '#fff',
};

export const wrongPrefix: MetricsWidgetTheme = {
	// @ts-expect-error only the chart-metric prefix is open-ended
	'mw-chart-metrics-publisher-website': '#123456',
};
