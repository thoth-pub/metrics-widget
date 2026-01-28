import {
	ChaptersDropdown,
	CSVDownloadButton,
	FilterDropdown,
} from '@/features';
import {
	config,
	ContentTab,
	NoDataPlaceholder,
	roundPercentage,
	type TabProps,
} from '@/shared';
import { TABS } from '@/shared/constants';
import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useCountriesTab } from './useCountriesTab';

const countriesListLimit = config.charts.countriesChart.countriesListLimit;
const title = `Top ${countriesListLimit} countries`;
const listItemStyle = 'flex gap-1 items-center';

export const CountriesTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const {
		metaData,
		metricsData,
		csvData,
		isLoading,
		platformOptions,
		selectedPlatforms,
		selectPlatform,
	} = useCountriesTab(doi);

	if (metricsData.length === 0 && !isLoading) {
		return (
			<ContentTab value={TABS.COUNTRIES} title={title}>
				<NoDataPlaceholder />
			</ContentTab>
		);
	}

	return (
		<ContentTab
			filter={<ChaptersDropdown chapters={metaData.chapters} />}
			action={<CSVDownloadButton data={csvData} />}
			value={TABS.COUNTRIES}
			className="bg-purple-500"
			title={title}
			isInfoOpen={isInfoOpen}
			isLoading={isLoading}
			onToggleInfo={toggleInfo}
		>
			<div className="flex flex-col gap-4">
				<FilterDropdown
					items={platformOptions}
					placeholder="platform"
					value={selectedPlatforms}
					onValueChange={selectPlatform}
				/>
				<div className="grid grid-cols-2">
					<ul className="text-xs flex flex-col gap-2.5 max-w-60">
						{metricsData.map(({ name, percentage, fill }) => (
							<li key={name} className={listItemStyle}>
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
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>
		</ContentTab>
	);
};
