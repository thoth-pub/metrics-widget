import {
	ChaptersDropdown,
	CSVDownloadButton,
	FilterDropdown,
	PieChartWithList,
} from '@/features';
import { config, ContentTab, NoDataPlaceholder, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
import { useCountriesTab } from './useCountriesTab';

const countriesListLimit = config.charts.countriesChart.countriesListLimit;
const title = `Top ${countriesListLimit} countries`;

export const CountriesTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const {
		metaData,
		metricsData,
		csvData,
		includedSources,
		isLoading,
		platformOptions,
		selectedPlatforms,
		selectPlatform,
	} = useCountriesTab(doi);

	if (metricsData.length === 0 && !isLoading) {
		return (
			<ContentTab value={TABS.COUNTRIES} title={title} includedSources={[]}>
				<NoDataPlaceholder />
			</ContentTab>
		);
	}

	return (
		<ContentTab
			includedSources={includedSources}
			filter={<ChaptersDropdown chapters={metaData.chapters} />}
			action={<CSVDownloadButton data={csvData} />}
			value={TABS.COUNTRIES}
			title={title}
			isInfoOpen={isInfoOpen}
			isLoading={isLoading}
			onToggleInfo={toggleInfo}
		>
			<FilterDropdown
				items={platformOptions}
				placeholder="platform"
				value={selectedPlatforms}
				onValueChange={selectPlatform}
			/>
			<PieChartWithList metricsData={metricsData} />
		</ContentTab>
	);
};
