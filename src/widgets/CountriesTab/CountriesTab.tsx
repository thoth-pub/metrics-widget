import { PieChartWithList } from '@/features';
import { config, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
import { GeographyContent } from '../MetricTab/GeographyContent';
import { MetricTab } from '../MetricTab/MetricTab';
import { useCountriesTab } from './useCountriesTab';

const countriesListLimit = config.charts.countriesChart.countriesListLimit;
const title = `Top ${countriesListLimit} countries`;

export const CountriesTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const { year, metricsData, csvData, captions, notes, problem, emptyText } =
		useCountriesTab(doi);

	return (
		<MetricTab
			value={TABS.COUNTRIES}
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
