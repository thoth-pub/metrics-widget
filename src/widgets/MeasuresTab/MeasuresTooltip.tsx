import type { Measure } from './useMeasuresTab';

type MeasuresTooltipProps = {
	active?: boolean;
	payload?: ReadonlyArray<{
		dataKey?: string;
		value?: number;
		color?: string;
		payload: Measure;
	}>;
	label?: string | number;
};

export const MeasuresTooltip = ({
	active,
	payload,
	label,
}: MeasuresTooltipProps) => {
	if (!active || !payload || !payload.length) return null;

	return (
		<div
			className="flex flex-col gap-1 bg-tooltip-background p-2.5 text-xs font-normal border border-transparent rounded-md"
			style={{
				borderRadius: '6px',
				boxShadow: 'var(--tooltip-drop-shadow)',
			}}
		>
			<div className="flex gap-1 items-center justify-center">
				<div
					className="colorPlaceholder"
					style={{ backgroundColor: payload[0].payload.fill }}
				/>
				<span>{`${label}`}</span>
			</div>

			<div className="h-px bg-divider w-full" />

			{payload.map((pld) => (
				<div key={pld.dataKey} style={{ color: pld.color }}>
					{pld.dataKey}: <strong>{pld.value}</strong>
				</div>
			))}
		</div>
	);
};
