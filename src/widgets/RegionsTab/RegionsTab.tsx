import {
	ChaptersDropdown,
	CSVDownloadButton,
	FilterDropdown,
	PieChartWithList,
} from '@/features';
import { ContentTab, NoDataPlaceholder, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
import { useRegionsTab } from './useRegionsTab';

const title = 'Continent Usage';

export const RegionsTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const {
		metaData,
		metricsData,
		csvData,
		platformOptions,
		selectedPlatforms,
		isLoading,
		includedSources,
		selectPlatform,
	} = useRegionsTab(doi);

	if (metricsData.length === 0 && !isLoading) {
		return (
			<ContentTab value={TABS.REGIONS} title={title} includedSources={[]}>
				<NoDataPlaceholder />
			</ContentTab>
		);
	}

	return (
		<ContentTab
			includedSources={includedSources}
			filter={<ChaptersDropdown chapters={metaData.chapters} />}
			action={<CSVDownloadButton data={csvData} />}
			value={TABS.REGIONS}
			title={title}
			isInfoOpen={isInfoOpen}
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
