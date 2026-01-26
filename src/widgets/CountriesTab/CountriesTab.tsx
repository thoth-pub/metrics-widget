import { ChaptersDropdown } from '@/features';
import { ContentTab, type MetaData, type TabProps } from '@/shared';

type CountriesTabProps = TabProps & {
	metaData: MetaData;
};

export const CountriesTab = ({
	isInfoOpen,
	toggleInfo,
	metaData,
}: CountriesTabProps) => {
	return (
		<ContentTab
			headerComponent={<ChaptersDropdown chapters={metaData.chapters} />}
			value="countries"
			className="bg-purple-500"
			title="Top 10 countries"
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			Countries
		</ContentTab>
	);
};
