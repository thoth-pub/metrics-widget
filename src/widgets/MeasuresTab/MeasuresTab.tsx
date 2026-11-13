import { MetricCaptions, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
import { useId } from 'react';
import {
	Bar,
	BarChart,
	type BarShapeProps,
	Rectangle,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { MetricTab } from '../MetricTab/MetricTab';
import { MeasuresTooltip } from './MeasuresTooltip';
import { MeasureTick } from './MeasureTick';
import { measureTickLabels } from './measureTickLabel';
import { type Measure, useMeasuresTab } from './useMeasuresTab';

const margin = {
	top: 20,
	// Room for the last x tick label, which is centred on the right edge of the plot.
	right: 24,
};

const title = 'Usage by measure';

const patternId = (prefix: string, measure: Measure) =>
	`${prefix}-stripe-${measure.patternKey}`;

/** Chapters bar: striped in the platform's colour; nothing when the total is unknown or not served. */
const chaptersBarShape = (prefix: string) =>
	function ChaptersBarShape(props: BarShapeProps) {
		const measure = props.payload as Measure;
		let height = props.height;
		let translateY = 0;

		if (measure.chapters === null) {
			return null;
		}

		if (measure.book === null) {
			height = height * 2;
			translateY = height / 2;
		}

		return (
			<Rectangle
				{...props}
				stroke="none"
				fillOpacity={1}
				fill={`url(#${patternId(prefix, measure)})`}
				height={height}
				style={{
					transform: `translateY(-${translateY}px)`,
				}}
			/>
		);
	};

/** Book (or Chapter) bar: solid; nothing when the total is unknown or not served. */
const BookBarShape = (props: BarShapeProps) => {
	const measure = props.payload as Measure;
	let height = props.height;

	if (measure.book === null) {
		return null;
	}

	if (measure.chapters === null) {
		height = height * 2;
	}

	return <Rectangle {...props} fill={measure.fill} height={height} />;
};

export const MeasuresTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const {
		year,
		measures,
		hasChaptersSection,
		isChapterEmbed,
		csvData,
		captions,
	} = useMeasuresTab(doi);
	const prefix = `mw${useId().replace(/[^A-Za-z0-9_-]/g, '')}`;
	// Long labels are drawn on more than one line, or on one line where the bars are too close, and shortened only
	// where a line does not fit; the tooltip shows the full label.
	const tickLabels = measureTickLabels(
		measures.map(({ key, name, platformName, measureName }) => ({
			key,
			label: name,
			platformName,
			measureName,
		})),
	);

	return (
		<MetricTab
			value={TABS.MEASURES}
			title={title}
			year={year}
			isInfoOpen={isInfoOpen}
			toggleInfo={toggleInfo}
			csvData={csvData}
		>
			<MetricCaptions captions={captions} />
			<div style={{ width: '100%', height: '100%', position: 'relative' }}>
				<div className="absolute right-0 top-0 text-xs flex gap-4">
					<div className="flex items-center gap-1">
						<div className="colorPlaceholder bg-chart-legend-background" />
						{isChapterEmbed ? 'Chapter' : 'Book'}
					</div>
					{hasChaptersSection && (
						<div className="flex items-center gap-1">
							<div className="colorPlaceholder bg-chart-legend-background bg-[repeating-linear-gradient(135deg,white_0px,white_1px,transparent_4px,transparent_4px)]" />
							Chapters
						</div>
					)}
				</div>
				<ResponsiveContainer>
					<BarChart
						data={measures}
						margin={margin}
						layout="vertical"
						barGap={0}
						barCategoryGap={2}
						height="100%"
					>
						<defs>
							{measures
								.filter((measure) => measure.chapters !== null)
								.map((measure) => (
									<pattern
										key={measure.key}
										id={patternId(prefix, measure)}
										width="6"
										height="4"
										patternUnits="userSpaceOnUse"
										patternTransform="rotate(45)"
									>
										<rect width="1" height="4" stroke={measure.fill} />
									</pattern>
								))}
						</defs>
						<XAxis
							type="number"
							fontSize={12}
							fontWeight={400}
							axisLine={{ stroke: 'none' }}
							tickLine={{ stroke: 'none' }}
							tickMargin={8}
						/>
						<YAxis
							dataKey="name"
							type="category"
							// Room for a drawn line of 20 characters (`MEASURE_TICK_LINE_LIMIT`).
							width={160}
							fontSize={12}
							fontWeight={400}
							scale="band"
							// Every bar keeps its label.
							interval={0}
							axisLine={{ stroke: 'none' }}
							tickLine={{ stroke: 'none' }}
							tick={<MeasureTick labels={tickLabels} />}
						/>
						<Tooltip
							cursor={false}
							content={(props) => (
								<MeasuresTooltip
									active={props.active}
									payload={
										props.payload as unknown as ReadonlyArray<{
											payload: Measure;
										}>
									}
									isChapterEmbed={isChapterEmbed}
								/>
							)}
						/>
						<Bar dataKey="book" shape={BookBarShape} />
						<Bar
							dataKey="chapters"
							fillOpacity={1}
							shape={chaptersBarShape(prefix)}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</MetricTab>
	);
};
