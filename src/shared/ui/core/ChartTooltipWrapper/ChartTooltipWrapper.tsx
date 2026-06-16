type ChartTooltipWrapperProps = {
	children: Readonly<React.ReactNode>;
};

export const ChartTooltipWrapper = ({ children }: ChartTooltipWrapperProps) => {
	return (
		<div
			className="flex flex-col gap-1 bg-tooltip-background p-2.5 text-xs font-normal border border-transparent rounded-md"
			style={{
				borderRadius: '6px',
				boxShadow: 'var(--mw-tooltip-drop-shadow)',
			}}
		>
			{children}
		</div>
	);
};
