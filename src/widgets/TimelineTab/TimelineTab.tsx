import { ChaptersDropdown } from '@/features';
import { ContentTab, NoDataPlaceholder, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
import { useTimelineTab } from './useTimelineTab';

const title = 'Usage by measure over time';

export const TimelineTab = ({ doi, isInfoOpen, toggleInfo }: TabProps) => {
	const { metaData, processedData, isLoading, error } = useTimelineTab(doi);

	if (processedData.length === 0 && !isLoading) {
		return (
			<ContentTab value={TABS.TIMELINE} title={title}>
				<NoDataPlaceholder />
			</ContentTab>
		);
	}

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
