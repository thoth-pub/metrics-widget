import { ChaptersDropdown } from '@/features';
import { ContentTab, type MetaData, type TabProps } from '@/shared';

type RegionsTabProps = TabProps & {
	metaData: MetaData;
};

export const RegionsTab = ({
	isInfoOpen,
	toggleInfo,
	metaData,
}: RegionsTabProps) => {
	return (
		<ContentTab
			headerComponent={<ChaptersDropdown chapters={metaData.chapters} />}
			value="regions"
			className="bg-yellow-500"
			title="Continent Usage"
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Regions
		</ContentTab>
	);
};
