import { ChaptersDropdown } from '@/features';
import { ContentTab, type TabProps } from '@/shared';

export const MapTab = ({ isInfoOpen, toggleInfo, doi }: TabProps) => {
	return (
		<ContentTab
			filter={<ChaptersDropdown chapters={[]} />}
			value="map"
			className="bg-green-500"
			title="Geographical Usage"
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Map {doi}
		</ContentTab>
	);
};
