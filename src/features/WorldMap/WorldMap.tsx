'use client';

import { config } from '@/shared';
import iso from 'iso-3166-1';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import geoData from './geoData.json';

type WorldMapProps = {
	tooltipContent?: string;
	isTooltipVisible?: boolean;
	onMouseEnter?: (countryName: string) => void;
	onMouseLeave?: () => void;
	updateCountryColor: (countryName: string) => string;
};

const {
	charts: {
		mapChartColors: { zeroValue },
	},
} = config;

export const WorldMap = (props: WorldMapProps) => {
	const { tooltipContent, onMouseEnter, onMouseLeave, updateCountryColor } =
		props;

	return (
		<ComposableMap
			projectionConfig={{
				scale: 160,
				center: [5, 0],
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
								if (!onMouseEnter) return;

								const countryName =
									iso.whereCountry(geo.properties.name)?.country ??
									geo.properties.name;

								onMouseEnter(countryName);
							}}
							onMouseLeave={onMouseLeave}
							style={{
								default: {
									fill: updateCountryColor(geo.properties.name),
									stroke: zeroValue,
								},
								hover: {
									fill: updateCountryColor(geo.properties.name),
									stroke: zeroValue,
								},
							}}
						/>
					))
				}
			</Geographies>
		</ComposableMap>
	);
};
