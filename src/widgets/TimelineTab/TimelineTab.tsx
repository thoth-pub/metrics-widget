import { ChaptersDropdown } from '@/features';
import { ContentTab, type MetaData, type TabProps } from '@/shared';

type TimelineTabProps = TabProps & {
	metaData: MetaData;
};

export const TimelineTab = ({
	isInfoOpen,
	toggleInfo,
	metaData,
}: TimelineTabProps) => {
	return (
		<ContentTab
			headerComponent={<ChaptersDropdown chapters={metaData.chapters} />}
			value="timeline"
			className="bg-blue-500"
			title="Usage by measure over time"
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Timeline
		</ContentTab>
	);
};
