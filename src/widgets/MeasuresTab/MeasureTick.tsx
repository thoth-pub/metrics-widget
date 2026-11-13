type MeasureTickProps = {
	x?: number | string;
	y?: number | string;
	payload?: { value?: unknown };
	fill?: string;
	fontSize?: number | string;
	fontWeight?: number | string;
	textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
	/** The drawn lines of each label (`measureTickLines`). */
	linesByLabel: Map<string, string[]>;
};

/** The first line sits where the one-line label always sat: level with the top of the pair's bars. */
const FIRST_LINE_OFFSET = 6;

/** A Measures y-axis tick: the label's drawn lines, one under the other. */
export const MeasureTick = ({
	x,
	y,
	payload,
	fill,
	fontSize,
	fontWeight,
	textAnchor,
	linesByLabel,
}: MeasureTickProps) => {
	const label = String(payload?.value ?? '');
	const lines = linesByLabel.get(label) ?? [label];

	return (
		<text
			x={x}
			y={Number(y) + FIRST_LINE_OFFSET}
			fill={fill ?? '#666'}
			fontSize={fontSize}
			fontWeight={fontWeight}
			textAnchor={textAnchor ?? 'end'}
		>
			{lines.map((line, index) => (
				// Two lines of one label can be equal, so the line's place is its key.
				// biome-ignore lint/suspicious/noArrayIndexKey: the lines of a label never reorder
				<tspan key={index} x={x} dy={index === 0 ? '0.355em' : '1.2em'}>
					{line}
				</tspan>
			))}
		</text>
	);
};
