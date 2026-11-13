'use client';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { resolveCssVar, useTheme } from '@/shared';
import geoData from './geoData.json';

type WorldMapProps = {
	tooltipContent?: string;
	isTooltipVisible?: boolean;
	/** Receives the map feature's own name; the caller matches it to a country code. */
	onMouseEnter?: (featureName: string) => void;
	onMouseLeave?: () => void;
	updateCountryColor: (featureName: string) => string;
};

export const WorldMap = (props: WorldMapProps) => {
	const { tooltipContent, onMouseEnter, onMouseLeave, updateCountryColor } =
		props;
	const theme = useTheme();
	const zeroStroke =
		theme?.['mw-chart-map-zero'] ?? resolveCssVar('--mw-chart-map-zero');

	return (
		<ComposableMap
			// Fits the land from northern Greenland (83.6° N) to Tierra del Fuego (56° S) in the 800 × 316 view, so
			// neither edge is clipped (scale 160 on the equator cut the north at any widget size).
			projectionConfig={{
				scale: 135,
				center: [5, 6],
			}}
			height={316}
			style={{ width: '100%', height: '100%' }}
		>
			<Geographies geography={geoData}>
				{({ geographies }) =>
					geographies.map((geo) => (
						<Geography
							data-tooltip-id="my-tooltip"
							data-tooltip-content={tooltipContent}
							strokeWidth={0.2}
							key={geo.rsmKey}
							geography={geo}
							onMouseEnter={() => {
								onMouseEnter?.(geo.properties.name);
							}}
							onMouseLeave={onMouseLeave}
							style={{
								default: {
									fill: updateCountryColor(geo.properties.name),
									stroke: zeroStroke,
								},
								hover: {
									fill: updateCountryColor(geo.properties.name),
									stroke: zeroStroke,
								},
							}}
						/>
					))
				}
			</Geographies>
		</ComposableMap>
	);
};
