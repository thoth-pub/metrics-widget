import type { MeasureTickLabel } from './measureTickLabel';

type MeasureTickProps = {
	x?: number | string;
	y?: number | string;
	payload?: { value?: unknown };
	fill?: string;
	fontSize?: number | string;
	fontWeight?: number | string;
	textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
	/** The height of the y axis and the number of ticks drawn on it, from Recharts: one band per pair. */
	height?: number | string;
	visibleTicksCount?: number;
	/** Both drawings of each label (`measureTickLabels`). */
	labels: Map<string, MeasureTickLabel>;
};

/** The first line sits where the one-line label always sat: level with the top of the pair's bars. */
const FIRST_LINE_OFFSET = 6;

/**
 * The height a label of `count` lines takes from the top of its band, in px: 1.4 em for the first line (set 6 px
 * below the top) and 1.2 em for each further line.
 */
const labelHeight = (count: number, fontSize: number) =>
	(1.4 + 1.2 * (count - 1)) * fontSize;

/**
 * The label's lines when its band is high enough for them; otherwise its one-line drawing, so that labels of
 * neighbouring bars never overlap. The band is the axis height over the number of ticks.
 */
const linesToDraw = (
	label: string,
	drawing: MeasureTickLabel | undefined,
	band: number,
	fontSize: number,
) => {
	if (!drawing) return [label];
	if (drawing.lines.length < 2) return drawing.lines;

	return band < labelHeight(drawing.lines.length, fontSize)
		? [drawing.line]
		: drawing.lines;
};

/** A Measures y-axis tick: the label's drawn lines, one under the other, or its one-line drawing. */
export const MeasureTick = ({
	x,
	y,
	payload,
	fill,
	fontSize,
	fontWeight,
	textAnchor,
	height,
	visibleTicksCount,
	labels,
}: MeasureTickProps) => {
	const label = String(payload?.value ?? '');
	const band = Number(height) / Math.max(Number(visibleTicksCount), 1);
	const lines = linesToDraw(
		label,
		labels.get(label),
		band,
		Number(fontSize ?? 12),
	);

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
