import { ChaptersDropdown } from '@/features';
import { ContentTab, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';

const title = 'Geographical Usage';

export const MapTab = ({ isInfoOpen, toggleInfo, doi }: TabProps) => {
	return (
		<ContentTab
			filter={<ChaptersDropdown chapters={[]} />}
			value={TABS.MAP}
			title={title}
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Map {doi}
		</ContentTab>
	);
};
