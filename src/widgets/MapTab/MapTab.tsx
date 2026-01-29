import 'react-tooltip/dist/react-tooltip.css';

import {
	ChaptersDropdown,
	CSVDownloadButton,
	FilterDropdown,
	WorldMap,
} from '@/features';
import { ContentTab, NoDataPlaceholder, type TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
import { Tooltip } from 'react-tooltip';
import { useMapTab } from './useMapTab';

const title = 'Geographical Usage';

export const MapTab = ({ isInfoOpen, toggleInfo, doi }: TabProps) => {
	const {
		metaData,
		metricsData,
		csvData,
		tooltipContent,
		isLoading,
		platformOptions,
		selectedPlatforms,
		updateContent,
		resetContent,
		getCountryColor,
		selectPlatform,
	} = useMapTab(doi);

	if (metricsData.length === 0 && !isLoading) {
		return (
			<ContentTab value={TABS.MAP} title={title}>
				<NoDataPlaceholder />
			</ContentTab>
		);
	}

	return (
		<ContentTab
			filter={<ChaptersDropdown chapters={metaData.chapters} />}
			action={<CSVDownloadButton data={csvData} />}
			value={TABS.MAP}
			title={title}
			isInfoOpen={isInfoOpen}
			onToggleInfo={toggleInfo}
		>
			<FilterDropdown
				items={platformOptions}
				placeholder="platform"
				value={selectedPlatforms}
				onValueChange={selectPlatform}
			/>
			<Tooltip
				id="my-tooltip"
				style={{
					color: 'var(--color-typography)',
					backgroundColor: 'var(--color-tooltip-background)',
					boxShadow: 'var(--tooltip-drop-shadow)',
					fontSize: '0.75rem',
					padding: '0.625rem',
					borderRadius: '0.375rem',
				}}
			/>
			<WorldMap
				tooltipContent={tooltipContent}
				isTooltipVisible={!!tooltipContent}
				onMouseEnter={updateContent}
				onMouseLeave={resetContent}
				updateCountryColor={getCountryColor}
			/>
		</ContentTab>
	);
};
