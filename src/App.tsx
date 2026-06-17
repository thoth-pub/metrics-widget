import { type Doi, isValidDoi, useMetaData } from '@/shared';
import {
	DataPlaceholder,
	ErrorBoundary,
	Tabs,
	TabsList,
	TabsTrigger,
	Wrapper,
} from '@/shared/ui';
import {
	ChartBar,
	ChartLine,
	CircleX,
	Earth,
	Globe,
	Map as MapIcon,
} from 'lucide-react';
import { lazy, useState } from 'react';
import { TABS } from './shared/constants';
import { MeasuresTab } from './widgets';

const CountriesTab = lazy(() =>
	import('./widgets/CountriesTab/CountriesTab').then((module) => ({
		default: module.CountriesTab,
	})),
);

const MapTab = lazy(() =>
	import('./widgets/MapTab/MapTab').then((module) => ({
		default: module.MapTab,
	})),
);

const RegionsTab = lazy(() =>
	import('./widgets/RegionsTab/RegionsTab').then((module) => ({
		default: module.RegionsTab,
	})),
);

const TimelineTab = lazy(() =>
	import('./widgets/TimelineTab/TimelineTab').then((module) => ({
		default: module.TimelineTab,
	})),
);

const textStyles = 'hidden @xs:block';

function App({ doi }: { doi: Doi }) {
	const isValid = isValidDoi(doi);
	const { error, refetch } = useMetaData(doi);

	const [isInfoOpen, setIsInfoOpen] = useState(false);

	if (!isValid) {
		return (
			<Wrapper>
				<DataPlaceholder icon={<CircleX />} title="Invalid DOI" />
			</Wrapper>
		);
	}

	if (error) {
		return <ErrorBoundary onRetry={() => refetch()} />;
	}

	const toggleInfo = () => setIsInfoOpen((prev) => !prev);

	const closeInfo = () => setIsInfoOpen(false);

	return (
		<Wrapper>
			<Tabs
				defaultValue={TABS.MEASURES}
				className="h-full"
				onValueChange={closeInfo}
			>
				<MeasuresTab
					doi={doi}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<TimelineTab
					doi={doi}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<MapTab doi={doi} isInfoOpen={isInfoOpen} toggleInfo={toggleInfo} />
				<RegionsTab doi={doi} isInfoOpen={isInfoOpen} toggleInfo={toggleInfo} />
				<CountriesTab
					doi={doi}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<TabsList className="w-full shrink-0 h-(--mw-footer-height)">
					<TabsTrigger value={TABS.MEASURES}>
						<ChartBar /> <span className={textStyles}>Measures</span>
					</TabsTrigger>
					<TabsTrigger value={TABS.TIMELINE}>
						<ChartLine /> <span className={textStyles}>Timeline</span>
					</TabsTrigger>
					<TabsTrigger value={TABS.MAP}>
						<MapIcon /> <span className={textStyles}>Map</span>
					</TabsTrigger>
					<TabsTrigger value={TABS.REGIONS}>
						<Globe /> <span className={textStyles}>Regions</span>
					</TabsTrigger>
					<TabsTrigger value={TABS.COUNTRIES}>
						<Earth /> <span className={textStyles}>Countries</span>
					</TabsTrigger>
				</TabsList>
			</Tabs>
		</Wrapper>
	);
}

export default App;
