/** The longest axis label shown whole; the tooltip always shows the full label. */
export const MEASURE_TICK_LIMIT = 20;

const SEPARATOR = ' · ';
const ELLIPSIS = '...';
const MIN_PLATFORM_CHARS = 4;

/**
 * The Measures axis label of a pair label (`<platform> · <measure>`, possibly with an ID suffix). A label up to the
 * limit is unchanged. A longer one keeps ` · <measure>` whole and shortens only the platform part, so two pairs of
 * one long-named platform stay distinguishable ("Open... · Downloads", "Open Book... · Views").
 */
export const measureTickLabel = (label: string, limit = MEASURE_TICK_LIMIT) => {
	if (label.length <= limit) return label;

	const at = label.indexOf(SEPARATOR);

	if (at === -1) return `${label.substring(0, limit)}${ELLIPSIS}`;

	const platform = label.slice(0, at);
	const rest = label.slice(at);
	const room = Math.max(
		limit - rest.length - ELLIPSIS.length,
		MIN_PLATFORM_CHARS,
	);

	if (platform.length <= room) return label;

	return `${platform.substring(0, room).trimEnd()}${ELLIPSIS}${rest}`;
};
