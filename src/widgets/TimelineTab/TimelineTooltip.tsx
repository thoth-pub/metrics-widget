import {
	ChartTooltipWrapper,
	convertShortMonthToLongMonth,
	NO_DATA_LABEL,
	type TimelineRow,
	type TimelineSeries,
} from '@/shared';

type TimelineTooltipProps = {
	series: TimelineSeries[];
	rows: TimelineRow[];
	/** The hovered pair: only its series are listed. All drawn series otherwise. */
	activePair: string | null;
	isMonthView: boolean;
	activeYear: string;
	colorOf: (platformId: string) => string;
	active?: boolean;
	label?: string | number;
};

/** The exact value of each series at the hovered bucket, or `no data` for an unknown value. */
export const TimelineTooltip = ({
	series,
	rows,
	activePair,
	isMonthView,
	activeYear,
	colorOf,
	active,
	label,
}: TimelineTooltipProps) => {
	if (!active || label === undefined) return null;

	const row = rows.find((item) => item.label === String(label));

	if (!row) return null;

	const shown = activePair
		? series.filter(({ pairKey }) => pairKey === activePair)
		: series;

	if (shown.length === 0) return null;

	const heading = isMonthView
		? `${convertShortMonthToLongMonth(String(label))} ${activeYear}`
		: String(label);

	return (
		<ChartTooltipWrapper>
			<span>{heading}</span>

			<div className="h-px bg-divider w-full" />

			{shown.map((item) => (
				<div key={item.id} className="flex gap-1 self-start items-center">
					<div
						className="colorPlaceholder"
						style={{ backgroundColor: colorOf(item.platformId) }}
					/>
					<span>
						{item.name}:{' '}
						<strong>{item.values[row.index] ?? NO_DATA_LABEL}</strong>
					</span>
				</div>
			))}
		</ChartTooltipWrapper>
	);
};
