import { roundPercentage } from '@/shared';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChartTooltip } from './PieChartTooltip';

type PieChartWithListProps = {
	metricsData: {
		name: string;
		percentage: number;
		fill: string;
	}[];
};

export const PieChartWithList = ({ metricsData }: PieChartWithListProps) => {
	return (
		<div className="grid grid-cols-2 grow overflow-clip">
			<ul className="text-xs flex flex-col gap-2.5 max-w-62 mt-3">
				{metricsData.map(({ name, percentage, fill }) => (
					<li key={name} className="flex gap-1 items-center">
						<div
							className="colorPlaceholder"
							style={{ backgroundColor: fill }}
						/>
						<span>
							{name}{' '}
							<span className="font-semibold">
								{roundPercentage(percentage)}%
							</span>
						</span>
					</li>
				))}
			</ul>
			<ResponsiveContainer>
				<PieChart>
					<Pie
						data={metricsData}
						dataKey="metrics"
						nameKey="name"
						innerRadius="40%"
						outerRadius="100%"
					>
						<Tooltip cursor={false} content={PieChartTooltip} />
					</Pie>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};
