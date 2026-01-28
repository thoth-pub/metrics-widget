import { ChaptersDropdown } from '@/features';
import {
	ContentTab,
	type TabProps,
	useMetricsByCountryOrRegion,
} from '@/shared';

export const RegionsTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const { metaData, preProcessedData } = useMetricsByCountryOrRegion({
		doi,
		type: 'continent_code',
	});

	console.log(preProcessedData);

	return (
		<ContentTab
			filter={<ChaptersDropdown chapters={metaData.chapters} />}
			value="regions"
			className="bg-yellow-500"
			title="Continent Usage"
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Regions {doi}
		</ContentTab>
	);
};
