import { ChartTooltipWrapper } from '@/shared';

type PieChartTooltip = {
	active?: boolean;
	payload?: ReadonlyArray<{
		name?: string;
		value?: number;
		color?: string;
		fill?: string;
		payload: {
			fill: string;
		};
	}>;
	label?: string | number;
};

export const PieChartTooltip = ({ active, payload }: PieChartTooltip) => {
	if (!active || !payload || !payload.length) return null;

	return (
		<ChartTooltipWrapper>
			{payload.map((pld) => (
				<div key={pld.name} className="flex gap-1 items-center">
					<div
						className="colorPlaceholder"
						style={{ backgroundColor: `${pld.payload.fill}` }}
					/>
					{pld.name}: <strong>{pld.value}</strong>
				</div>
			))}
		</ChartTooltipWrapper>
	);
};
