import { ChaptersDropdown } from '@/features';
import { ContentTab, type MetaData, type TabProps } from '@/shared';

type MeasuresTabProps = TabProps & {
	metaData: MetaData;
};

export const MeasuresTab = ({
	isInfoOpen,
	toggleInfo,
	metaData,
}: MeasuresTabProps) => {
	return (
		<ContentTab
			headerComponent={<ChaptersDropdown chapters={metaData.chapters} />}
			value="measures"
			title="Usage by measure"
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Measures
		</ContentTab>
	);
};
