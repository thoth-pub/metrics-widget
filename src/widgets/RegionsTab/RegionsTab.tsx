import { PieChartWithList } from '@/features';
import type { TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
import { GeographyContent } from '../MetricTab/GeographyContent';
import { MetricTab } from '../MetricTab/MetricTab';
import { useRegionsTab } from './useRegionsTab';

const title = 'Continent Usage';

export const RegionsTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const { year, metricsData, csvData, captions, notes, problem, emptyText } =
		useRegionsTab(doi);

	return (
		<MetricTab
			value={TABS.REGIONS}
			title={title}
			year={year}
			isInfoOpen={isInfoOpen}
			toggleInfo={toggleInfo}
			csvData={csvData}
		>
			<GeographyContent
				captions={captions}
				notes={notes}
				problem={problem}
				emptyText={emptyText}
			>
				<PieChartWithList metricsData={metricsData} />
			</GeographyContent>
		</MetricTab>
	);
};
