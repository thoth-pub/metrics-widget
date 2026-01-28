import { ChaptersDropdown } from '@/features';
import { ContentTab, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';

const title = 'Usage by measure over time';

export const TimelineTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	return (
		<ContentTab
			filter={<ChaptersDropdown chapters={[]} />}
			value={TABS.TIMELINE}
			title={title}
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Timeline {doi}
		</ContentTab>
	);
};
