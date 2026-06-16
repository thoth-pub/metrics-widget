import { convertShortMonthToLongMonth, updateSource } from '@/shared';
import { ChartTooltipWrapper } from '@/shared/ui/core/ChartTooltipWrapper/ChartTooltipWrapper';

type TimelineTooltipProps = {
	activeSeries: string | null;
	activeYear: string;
	active?: boolean;
	payload?: ReadonlyArray<{
		dataKey?: string;
		value?: number;
		color?: string;
		payload: {
			source: string;
		};
	}>;
	label?: string | number;
};

export const TimelineTooltip = ({
	activeSeries,
	activeYear,
	active,
	payload,
	label,
}: TimelineTooltipProps) => {
	if (!activeSeries || !active || !payload || !payload.length) return null;

	const filteredPayload = payload?.filter(
		(pld) => updateSource(pld.payload.source) === activeSeries,
	);

	if (filteredPayload.length === 0) return null;

	const bookCount =
		filteredPayload.find((pld) => pld.dataKey === 'book')?.value ?? 0;
	const chaptersCount =
		filteredPayload.find((pld) => pld.dataKey === 'chapters')?.value ?? 0;

	if (bookCount === 0 && chaptersCount === 0) return null;

	const appliedLabel = label
		? convertShortMonthToLongMonth(label.toString())
		: '';

	return (
		<ChartTooltipWrapper>
			<span>
				{appliedLabel} {activeYear}
			</span>

			<div className="flex gap-1 self-start items-center justify-center">
				<div
					className="colorPlaceholder"
					style={{ backgroundColor: filteredPayload[0].color }}
				/>
				<span>{activeSeries}</span>
			</div>

			<div className="h-px bg-divider w-full" />

			{bookCount > 0 && (
				<span>
					Book: <strong>{bookCount}</strong>
				</span>
			)}
			{chaptersCount > 0 && (
				<span>
					Chapters: <strong>{chaptersCount}</strong>
				</span>
			)}
		</ChartTooltipWrapper>
	);
};
