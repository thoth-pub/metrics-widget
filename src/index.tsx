import './index.css';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import type { Doi, MetricsWidgetTheme } from '@/shared';
import { Providers } from '@/shared';
import App from './App';

export type {
	MetricsWidgetTheme,
	MetricsWidgetTokenName,
} from '@/shared';

type MetricsWidgetProps = {
	doi: Doi;
	theme?: MetricsWidgetTheme | null;
};

export const MetricsWidget = ({ doi, theme }: MetricsWidgetProps) => (
	<Providers theme={theme}>
		<App doi={doi} />
	</Providers>
);

export interface MetricsWidgetInitOptions {
	theme?: MetricsWidgetTheme;
}

export interface MetricsWidgetInstance {
	unmount: () => void;
	setTheme: (theme: MetricsWidgetTheme | undefined) => void;
}

/**
 * Initialize the widget in a vanilla JS project
 *
 * @example
 * ```js
 * import { initMetricsWidget } from 'metrics-widget';
 *
 * const widget = initMetricsWidget('app', '10.36615/9781776402304', {
 *   theme: { 'mw-color-background': '#1a1a1a' },
 * });
 *
 * widget.setTheme({ 'mw-color-background': '#fff' });
 * widget.unmount();
 * ```
 */
const initMetricsWidget = (
	containerId: string,
	doi: Doi,
	options: MetricsWidgetInitOptions = {},
): MetricsWidgetInstance => {
	const container = document.getElementById(containerId);

	if (!container) {
		throw new Error(`Container with id "${containerId}" not found`);
	}

	const root: Root = createRoot(container);
	let currentTheme = options.theme;

	const render = () => {
		root.render(
			<Providers theme={currentTheme}>
				<App doi={doi} />
			</Providers>,
		);
	};

	render();

	return {
		unmount: () => root.unmount(),
		setTheme: (theme) => {
			currentTheme = theme;
			render();
		},
	};
};

export { initMetricsWidget };

// Default export for convenience
export default initMetricsWidget;
