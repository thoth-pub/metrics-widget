import './index.css';
import { createElement } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import type { Doi } from '@/shared';
import App from './App';

// Export the component for React projects
export { default as MetricsWidget } from './App';

// Types for vanilla JS initialization
export interface MetricsWidgetOptions {
	doi: Doi;
}

export interface MetricsWidgetInstance {
	unmount: () => void;
}

/**
 * Initialize the widget in a vanilla JS project
 *
 * @example
 * ```js
 * import { initMetricsWidget } from 'metrics-widget';
 *
 * const widget = initMetricsWidget('app', 'https://doi.org/10.36615/9781776402304' or '10.36615/9781776402304');
 */
const initMetricsWidget = (
	containerId: string,
	doi: Doi,
): MetricsWidgetInstance => {
	const container = document.getElementById(containerId);

	if (!container) {
		throw new Error(`Container with id "${containerId}" not found`);
	}

	const root: Root = createRoot(container);

	const render = () => {
		root.render(createElement(App, { doi }));
	};

	render();

	return {
		unmount: () => root.unmount(),
	};
};

// Named export for ES modules
export { initMetricsWidget };

// Default export for convenience
export default initMetricsWidget;
