import 'react-tooltip/dist/react-tooltip.css';

import { WorldMap } from '@/features';
import type { TabProps } from '@/shared';
import { TABS } from '@/shared/constants';
import { Tooltip } from 'react-tooltip';
import { GeographyContent } from '../MetricTab/GeographyContent';
import { MetricTab } from '../MetricTab/MetricTab';
import { useMapTab } from './useMapTab';

const title = 'Geographical Usage';

export const MapTab = ({ isInfoOpen, toggleInfo, doi }: TabProps) => {
	const {
		year,
		csvData,
		captions,
		notes,
		problem,
		emptyText,
		tooltipContent,
		updateContent,
		resetContent,
		getCountryColor,
	} = useMapTab(doi);

	return (
		<MetricTab
			value={TABS.MAP}
			title={title}
			year={year}
			isInfoOpen={isInfoOpen}
			toggleInfo={toggleInfo}
			csvData={csvData}
		>
			<GeographyContent
				captions={captions}
				notes={notes}
				problem={problem}
				emptyText={emptyText}
			>
				<Tooltip
					id="my-tooltip"
					style={{
						color: 'var(--mw-color-typography)',
						backgroundColor: 'var(--mw-color-tooltip-background)',
						boxShadow: 'var(--mw-tooltip-drop-shadow)',
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
			</GeographyContent>
		</MetricTab>
	);
};
