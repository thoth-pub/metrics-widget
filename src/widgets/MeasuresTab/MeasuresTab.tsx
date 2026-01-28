import { ChaptersDropdown, CSVDownloadButton } from '@/features';
import { ContentTab, NoDataPlaceholder, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
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
import { MeasuresTooltip } from './MeasuresTooltip';
import { useMeasuresTab } from './useMeasuresTab';

const margin = {
	top: 20,
};

const title = 'Usage by measure';

export const MeasuresTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const { metaData, measures, strokes, csvData, isLoading } =
		useMeasuresTab(doi);

	const processedData = Object.values(measures).map((item) => ({
		...item,
		Book: item.Book === 0 ? null : item.Book,
		Chapters: item.Chapters === 0 ? null : item.Chapters,
	}));

	const ChaptersBarShape = (props: BarShapeProps) => {
		let height = props.height;

		if (!props.payload.Chapters) {
			return null;
		}

		if (!props.payload.Book) {
			height = height * 1.5;
		}

		return (
			<Rectangle
				{...props}
				stroke="none"
				fillOpacity={1}
				fill={`url(#${props.stroke})`}
				height={height}
			/>
		);
	};

	const BookBarShape = (props: BarShapeProps) => {
		let height = props.height;

		if (!props.payload.Book) {
			return null;
		}

		if (!props.payload.Chapters) {
			height = height * 1.5;
		}

		return <Rectangle {...props} height={height} />;
	};

	const tickFormatter = (value: string, _index: number) => {
		const limit = 20;

		const formattedValue = value
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

		if (formattedValue.length < limit) return formattedValue;

		return `${formattedValue.substring(0, limit)}...`.replace(/ /g, '\u00A0');
	};

	if (processedData.length === 0 && !isLoading) {
		return (
			<ContentTab value={TABS.MEASURES} title={title}>
				<NoDataPlaceholder />
			</ContentTab>
		);
	}

	return (
		<ContentTab
			filter={<ChaptersDropdown chapters={metaData.chapters} />}
			action={<CSVDownloadButton data={csvData} />}
			value={TABS.MEASURES}
			title={title}
			isInfoOpen={isInfoOpen}
			isLoading={isLoading}
			onToggleInfo={toggleInfo}
		>
			<div style={{ width: '100%', height: '100%', position: 'relative' }}>
				{processedData.length && (
					<div className="absolute right-0 top-0 text-xs flex gap-4">
						<div className="flex items-center gap-1">
							<div className="colorPlaceholder bg-chart-legend-background" />
							Book
						</div>
						<div className="flex items-center gap-1">
							<div className="colorPlaceholder bg-chart-legend-background bg-[repeating-linear-gradient(135deg,white_0px,white_1px,transparent_4px,transparent_4px)]" />
							Chapters
						</div>
					</div>
				)}
				<ResponsiveContainer>
					<BarChart
						data={processedData}
						margin={margin}
						layout="vertical"
						barGap={0}
					>
						<defs>
							{Object.entries(strokes).map(([strokeId, color]) => (
								<pattern
									key={strokeId}
									id={strokeId}
									width="6"
									height="4"
									patternUnits="userSpaceOnUse"
									patternTransform="rotate(45)"
								>
									<rect width="1" height="4" stroke={color} />
								</pattern>
							))}
						</defs>
						<XAxis
							type="number"
							fontSize={12}
							fontWeight={400}
							axisLine={{ stroke: 'none' }}
							tickLine={{ stroke: 'none' }}
						/>
						<YAxis
							dataKey="name"
							type="category"
							width={150}
							fontSize={12}
							fontWeight={400}
							tickFormatter={tickFormatter}
							axisLine={{ stroke: 'none' }}
							tickLine={{ stroke: 'none' }}
						/>

						<Bar dataKey="Book" shape={BookBarShape} />
						<Bar dataKey="Chapters" fillOpacity={1} shape={ChaptersBarShape}>
							<Tooltip cursor={false} content={MeasuresTooltip} />
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</ContentTab>
	);
};
