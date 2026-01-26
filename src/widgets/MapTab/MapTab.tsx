import { ChaptersDropdown } from '@/features';
import { ContentTab, type MetaData, type TabProps } from '@/shared';

type MapTabProps = TabProps & {
	metaData: MetaData;
};

export const MapTab = ({ isInfoOpen, toggleInfo, metaData }: MapTabProps) => {
	return (
		<ContentTab
			headerComponent={<ChaptersDropdown chapters={metaData.chapters} />}
			value="map"
			className="bg-green-500"
			title="Geographical Usage"
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Map
		</ContentTab>
	);
};
