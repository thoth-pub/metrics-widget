import type { ReactNode } from 'react';

/**
 * A stand-in for `react-simple-maps` in tests that render the whole app. The real package loads `d3-zoom` and
 * `d3-drag` as CommonJS, which `require()` the ES module `d3-selection` in a cycle; Node before 22.15 (CI runs
 * 22.14.0) refuses that. The stub keeps what the widget relies on: one `Geography` per feature of the TopoJSON
 * `geography`, with the feature's `properties.name`, and the fill the widget computes for it.
 */

type Feature = { properties: { name: string }; rsmKey: string };

type Topology = {
	objects: Record<string, { geometries: { properties: { name: string } }[] }>;
};

export const ComposableMap = ({ children }: { children?: ReactNode }) => (
	<svg data-testid="world-map">
		<title>World map</title>
		{children}
	</svg>
);

export const Geographies = ({
	geography,
	children,
}: {
	geography: Topology;
	children: (props: { geographies: Feature[] }) => ReactNode;
}) => {
	const geographies = Object.values(geography.objects).flatMap((object) =>
		object.geometries.map((geometry, index) => ({
			properties: geometry.properties,
			rsmKey: `geo-${index}`,
		})),
	);

	return <g>{children({ geographies })}</g>;
};

export const Geography = ({
	geography,
	style,
}: {
	geography: Feature;
	style?: { default?: { fill?: string } };
}) => (
	<path data-name={geography.properties.name} fill={style?.default?.fill} />
);
