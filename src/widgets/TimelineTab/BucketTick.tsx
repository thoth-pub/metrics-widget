type BucketTickProps = {
	x?: number | string;
	y?: number | string;
	payload?: { value?: unknown };
	fill?: string;
	fontSize?: number | string;
};

/**
 * The lines of a timeline axis label: a part-year bucket label (`2026 (Jan–Nov)`) is split into the year and its
 * months, so it is no wider than a whole-year label and neither it nor its neighbour is dropped or clipped.
 */
export const bucketTickLines = (label: string) => {
	const at = label.indexOf(' (');

	return at === -1 ? [label] : [label.slice(0, at), label.slice(at + 1)];
};

/** A timeline x-axis tick that draws a part-year label on two lines. */
export const BucketTick = ({
	x,
	y,
	payload,
	fill,
	fontSize,
}: BucketTickProps) => {
	const lines = bucketTickLines(String(payload?.value ?? ''));

	return (
		<text
			x={x}
			y={y}
			fill={fill ?? '#666'}
			fontSize={fontSize}
			textAnchor="middle"
		>
			{lines.map((line, index) => (
				<tspan key={line} x={x} dy={index === 0 ? '0.71em' : '1.2em'}>
					{line}
				</tspan>
			))}
		</text>
	);
};
