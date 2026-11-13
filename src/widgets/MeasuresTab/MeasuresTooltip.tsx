import { ChartTooltipWrapper, NO_DATA_LABEL } from '@/shared';
import type { Measure } from './useMeasuresTab';

type MeasuresTooltipProps = {
	active?: boolean;
	payload?: ReadonlyArray<{ payload: Measure }>;
	isChapterEmbed: boolean;
};

const valueText = (value: string | null) => value ?? NO_DATA_LABEL;

/** The pair's exact totals per section it serves; `no data` for an unknown total. */
export const MeasuresTooltip = ({
	active,
	payload,
	isChapterEmbed,
}: MeasuresTooltipProps) => {
	if (!active || !payload || !payload.length) return null;

	const measure = payload[0].payload;

	return (
		<ChartTooltipWrapper>
			<div className="flex gap-1 items-center justify-center">
				<div
					className="colorPlaceholder"
					style={{ backgroundColor: measure.fill }}
				/>
				<span>{measure.name}</span>
			</div>

			<div className="h-px bg-divider w-full" />

			{measure.bookValue !== undefined && (
				<div>
					{isChapterEmbed ? 'Chapter' : 'Book'}:{' '}
					<strong>{valueText(measure.bookValue)}</strong>
				</div>
			)}
			{measure.chaptersValue !== undefined && (
				<div>
					Chapters: <strong>{valueText(measure.chaptersValue)}</strong>
				</div>
			)}
		</ChartTooltipWrapper>
	);
};
