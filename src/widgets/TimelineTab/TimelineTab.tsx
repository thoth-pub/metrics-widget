import {
	ChaptersDropdown,
	CSVDownloadButton,
	FilterDropdown,
} from '@/features';
import {
	Button,
	config,
	ContentTab,
	NoDataPlaceholder,
	type TabProps,
} from '@/shared';
import { TABS } from '@/shared/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
	type ActiveDotProps,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { TimelineTooltip } from './TimelineTooltip';
import { useTimelineTab } from './useTimelineTab';

const title = 'Usage by measure over time';

const {
	timelineChart: {
		defaultChartOpacity,
		inactiveChartOpacity,
		activeChartOpacity,
		defaultDotOpacity,
		inactiveDotOpacity,
		activeDotOpacity,
		strokeDasharray,
		lineStrokeWidth,
		lineDotStrokeWidth,
		lineDotRadius,
	},
	tickMargin,
} = config.charts;

const calculateLineOpacity = (
	activeSeries: string | null,
	seriesName: string,
) => {
	if (!activeSeries) return defaultChartOpacity;

	return activeSeries === seriesName
		? activeChartOpacity
		: inactiveChartOpacity;
};

const calculateDotOpacity = (
	activeSeries: string | null,
	seriesName: string,
) => {
	if (!activeSeries) return defaultDotOpacity;

	return activeSeries === seriesName ? activeDotOpacity : inactiveDotOpacity;
};

export const TimelineTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const {
		metaData,
		processedData,
		activeYear,
		xKey,
		isLoading,
		csvData,
		platformOptions,
		selectedYears,
		selectedPlatforms,
		selectPlatform,
		yearsOptions,
		setSelectedYears,
		nextPage,
		previousPage,
		isNextPageAvailable,
		isPreviousPageAvailable,
		isPaginationAvailable,
		includedSources,
	} = useTimelineTab(doi);

	const [activeSeries, setActiveSeries] = useState<string | null>(null);

	if (processedData.length === 0 && !isLoading) {
		return (
			<ContentTab value={TABS.TIMELINE} title={title} includedSources={[]}>
				<NoDataPlaceholder />
			</ContentTab>
		);
	}

	const CustomizedActiveDot = (
		props: ActiveDotProps & { seriesName: string },
	) => {
		const { seriesName, ...rest } = props;

		const { onPointerEnter, onPointerLeave, style, ...svgCircleProps } =
			rest as React.SVGProps<SVGCircleElement>;

		return (
			<circle
				{...svgCircleProps}
				onPointerEnter={() => setActiveSeries(seriesName)}
				onPointerLeave={() => setActiveSeries(null)}
				stroke={props.color}
				strokeWidth={lineDotStrokeWidth}
				style={{
					r: lineDotRadius,
					opacity: calculateDotOpacity(activeSeries, seriesName),
				}}
			/>
		);
	};

	return (
		<ContentTab
			includedSources={includedSources}
			filter={<ChaptersDropdown chapters={metaData.chapters} />}
			action={<CSVDownloadButton data={csvData} />}
			value={TABS.TIMELINE}
			title={title}
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			<div className="flex items-center gap-1 justify-between">
				<div className="flex gap-2">
					<FilterDropdown
						items={platformOptions}
						placeholder="platform"
						value={selectedPlatforms}
						onValueChange={selectPlatform}
					/>
					<FilterDropdown
						items={yearsOptions}
						placeholder="year"
						value={selectedYears}
						onValueChange={setSelectedYears}
						inputClassName="w-25"
					/>
				</div>
				{isPaginationAvailable && (
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon"
							onClick={previousPage}
							disabled={!isPreviousPageAvailable}
						>
							<ChevronLeft />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={nextPage}
							disabled={!isNextPageAvailable}
						>
							<ChevronRight />
						</Button>
					</div>
				)}
			</div>
			<ResponsiveContainer className="overflow-clip">
				<LineChart
					style={{
						fontSize: 12,
						fontWeight: 400,
					}}
					margin={{
						top: 20,
						bottom: 10,
					}}
				>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey={xKey}
						axisLine={{ stroke: 'none' }}
						tickLine={{ stroke: 'none' }}
						tickMargin={tickMargin}
						type="category"
						allowDuplicatedCategory={false}
					/>
					<YAxis axisLine={{ stroke: 'none' }} />
					<Tooltip
						cursor={{ strokeDasharray }}
						content={(props) => (
							<TimelineTooltip
								activeSeries={activeSeries}
								activeYear={activeYear}
								{...props}
							/>
						)}
					/>
					{processedData.map((s) => (
						<>
							<Line
								type="monotone"
								dataKey="book"
								data={s.data}
								dot={false}
								stroke={s.color}
								activeDot={(props) => (
									<CustomizedActiveDot {...props} seriesName={s.name} />
								)}
								strokeOpacity={calculateLineOpacity(activeSeries, s.name)}
								strokeWidth={lineStrokeWidth}
							/>
							<Line
								type="monotone"
								dataKey="chapters"
								data={s.data}
								strokeDasharray={strokeDasharray}
								stroke={s.color}
								strokeWidth={lineStrokeWidth}
								dot={false}
								activeDot={(props) => (
									<CustomizedActiveDot {...props} seriesName={s.name} />
								)}
								strokeOpacity={calculateLineOpacity(activeSeries, s.name)}
							/>
						</>
					))}
				</LineChart>
			</ResponsiveContainer>
		</ContentTab>
	);
};
