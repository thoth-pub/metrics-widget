import { FilterDropdown } from '@/features';
import {
	Button,
	config,
	MetricCaptions,
	MetricErrorState,
	MetricWidgetUnavailableError,
	NoDataPlaceholder,
	Spinner,
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
import { MetricTab } from '../MetricTab/MetricTab';
import { BucketTick } from './BucketTick';
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

const calculateLineOpacity = (activePair: string | null, pairKey: string) => {
	if (!activePair) return defaultChartOpacity;

	return activePair === pairKey ? activeChartOpacity : inactiveChartOpacity;
};

const calculateDotOpacity = (activePair: string | null, pairKey: string) => {
	if (!activePair) return defaultDotOpacity;

	return activePair === pairKey ? activeDotOpacity : inactiveDotOpacity;
};

type TimelineTabProps = TabProps & {
	/** True while the Timeline tab is the active tab: only then is a month read sent. */
	isActive?: boolean;
};

export const TimelineTab = ({
	doi,
	isInfoOpen,
	toggleInfo,
	isActive = false,
}: TimelineTabProps) => {
	const {
		year,
		month,
		isMonthView,
		activeYear,
		series,
		rows,
		colorOf,
		csvData,
		captions,
		info,
		seriesOptions,
		selectedSeries,
		selectSeries,
		yearsOptions,
		selectedYears,
		setSelectedYears,
		nextPage,
		previousPage,
		isNextPageAvailable,
		isPreviousPageAvailable,
		isPaginationAvailable,
	} = useTimelineTab(doi, isActive);

	const [activePair, setActivePair] = useState<string | null>(null);

	const CustomizedActiveDot = (props: ActiveDotProps & { pairKey: string }) => {
		const { pairKey, ...rest } = props;

		const { onPointerEnter, onPointerLeave, style, ...svgCircleProps } =
			rest as React.SVGProps<SVGCircleElement>;

		return (
			<circle
				{...svgCircleProps}
				onPointerEnter={() => setActivePair(pairKey)}
				onPointerLeave={() => setActivePair(null)}
				stroke={props.color}
				strokeWidth={lineDotStrokeWidth}
				style={{
					r: lineDotRadius,
					opacity: calculateDotOpacity(activePair, pairKey),
				}}
			/>
		);
	};

	let monthState: React.ReactNode = null;

	if (isMonthView) {
		if (month.isLoading) {
			monthState = <Spinner className="m-auto size-12 h-full text-spinner" />;
		} else if (month.error) {
			monthState = (
				<MetricErrorState
					isUnavailable={month.error instanceof MetricWidgetUnavailableError}
					onRetry={month.retry}
				/>
			);
		} else if (!month.view || month.view.isEmpty) {
			monthState = <NoDataPlaceholder />;
		}
	}

	return (
		<MetricTab
			value={TABS.TIMELINE}
			title={title}
			year={year}
			isInfoOpen={isInfoOpen}
			toggleInfo={toggleInfo}
			info={info}
			csvData={monthState ? undefined : csvData}
		>
			<div className="flex items-center gap-1 justify-between">
				<div className="flex gap-2">
					<FilterDropdown
						items={seriesOptions}
						placeholder="measure"
						value={selectedSeries}
						onValueChange={selectSeries}
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
			{monthState ?? (
				<>
					<MetricCaptions captions={captions} />
					<ResponsiveContainer className="overflow-clip">
						<LineChart
							data={rows}
							style={{
								fontSize: 12,
								fontWeight: 400,
							}}
							margin={{
								top: 20,
								// Room for the last tick label, which is centred on the last point.
								right: 24,
								bottom: 10,
							}}
						>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="label"
								axisLine={{ stroke: 'none' }}
								tickLine={{ stroke: 'none' }}
								tickMargin={tickMargin}
								type="category"
								tick={<BucketTick />}
								height={40}
							/>
							<YAxis axisLine={{ stroke: 'none' }} />
							<Tooltip
								cursor={{ strokeDasharray }}
								content={(props) => (
									<TimelineTooltip
										series={series}
										rows={rows}
										activePair={activePair}
										isMonthView={isMonthView}
										activeYear={activeYear}
										colorOf={colorOf}
										active={props.active}
										label={props.label}
									/>
								)}
							/>
							{series.map((item) => (
								<Line
									key={item.id}
									type="monotone"
									dataKey={item.dataKey}
									name={item.name}
									dot={false}
									connectNulls={false}
									stroke={colorOf(item.platformId)}
									strokeDasharray={
										item.sectionId === 'chapters' ? strokeDasharray : undefined
									}
									strokeWidth={lineStrokeWidth}
									strokeOpacity={calculateLineOpacity(activePair, item.pairKey)}
									activeDot={(props) => (
										<CustomizedActiveDot {...props} pairKey={item.pairKey} />
									)}
								/>
							))}
						</LineChart>
					</ResponsiveContainer>
				</>
			)}
		</MetricTab>
	);
};
