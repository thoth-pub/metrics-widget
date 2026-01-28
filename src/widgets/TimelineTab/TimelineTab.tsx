import { ChaptersDropdown } from '@/features';
import { ContentTab, type TabProps } from '@/shared';

export const TimelineTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	return (
		<ContentTab
			filter={<ChaptersDropdown chapters={[]} />}
			value="timeline"
			className="bg-blue-500"
			title="Usage by measure over time"
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Timeline {doi}
		</ContentTab>
	);
};
