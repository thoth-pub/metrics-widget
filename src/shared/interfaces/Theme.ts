// Raw color anchors (e.g. `mw-purple`, `mw-gray`) are intentionally NOT part of the
// public override surface — only the semantic and component-level tokens below are
// exposed via the `theme` prop.
export type MetricsWidgetTokenName =
	// Semantic
	| 'mw-color-background'
	| 'mw-color-background-active'
	| 'mw-color-background-alt'
	| 'mw-color-typography'
	| 'mw-color-typography-alt'
	| 'mw-color-border'
	| 'mw-color-active'
	| 'mw-ring'
	// Components
	| 'mw-color-nav-background'
	| 'mw-color-nav-background-active'
	| 'mw-color-nav-typography'
	| 'mw-color-header-background'
	| 'mw-color-button-background'
	| 'mw-color-button-typography'
	| 'mw-color-button-border'
	| 'mw-color-button-typography-hover'
	| 'mw-color-button-border-hover'
	| 'mw-color-button-typography-active'
	| 'mw-color-button-border-active'
	| 'mw-color-button-active-background'
	| 'mw-color-button-active-typography'
	| 'mw-color-button-active-border'
	| 'mw-color-input-background'
	| 'mw-color-input-border'
	| 'mw-color-input-typography'
	| 'mw-color-select-background-selected'
	| 'mw-color-input-start-icon'
	| 'mw-color-tooltip-background'
	| 'mw-tooltip-drop-shadow'
	| 'mw-color-divider'
	| 'mw-color-spinner'
	| 'mw-chart-legend-background'
	| 'mw-color-placeholder-icon'
	| 'mw-color-placeholder-icon-bg'
	// shadcn-derived (used by primitives)
	| 'mw-radius'
	| 'mw-background'
	| 'mw-foreground'
	| 'mw-popover'
	| 'mw-popover-foreground'
	| 'mw-primary'
	| 'mw-primary-foreground'
	| 'mw-secondary'
	| 'mw-secondary-foreground'
	| 'mw-muted'
	| 'mw-muted-foreground'
	| 'mw-destructive'
	| 'mw-border'
	// Layout
	| 'mw-max-width'
	| 'mw-max-height'
	| 'mw-header-height'
	| 'mw-footer-height'
	| 'mw-content-height'
	// Countries chart palette
	| 'mw-color-countries-1'
	| 'mw-color-countries-2'
	| 'mw-color-countries-3'
	| 'mw-color-countries-4'
	| 'mw-color-countries-5'
	| 'mw-color-countries-6'
	| 'mw-color-countries-7'
	| 'mw-color-countries-8'
	| 'mw-color-countries-9'
	| 'mw-color-countries-10'
	| 'mw-color-countries-11'
	// Metric chart palette (per-platform / source)
	| 'mw-chart-metric-default'
	| 'mw-chart-metric-the-classics-library'
	| 'mw-chart-metric-google-books'
	| 'mw-chart-metric-open-book-publishers'
	| 'mw-chart-metric-open-book-publishers-html-reader'
	| 'mw-chart-metric-open-book-publishers-pdf-reader'
	| 'mw-chart-metric-open-edition'
	| 'mw-chart-metric-oapen'
	| 'mw-chart-metric-twitter'
	| 'mw-chart-metric-wikimedia'
	| 'mw-chart-metric-wikipedia'
	| 'mw-chart-metric-wordpress-com'
	| 'mw-chart-metric-world-reader'
	| 'mw-chart-metric-crossref'
	// Map chart palette
	| 'mw-chart-map-zero'
	| 'mw-chart-map-lowest'
	| 'mw-chart-map-highest';

export type MetricsWidgetTheme = Partial<
	Record<MetricsWidgetTokenName, string>
>;

export const NON_COLOR_TOKENS = new Set<MetricsWidgetTokenName>([
	'mw-max-width',
	'mw-max-height',
	'mw-header-height',
	'mw-footer-height',
	'mw-content-height',
	'mw-radius',
	'mw-tooltip-drop-shadow',
]);
