import { type Doi, isValidDoi, useMetaData } from '@/shared';
import {
	ErrorBoundary,
	Tabs,
	TabsList,
	TabsTrigger,
	Wrapper,
} from '@/shared/ui';
import {
	ChartBar,
	ChartLine,
	Earth,
	Globe,
	Map as MapIcon,
} from 'lucide-react';
import { useState } from 'react';
import { TABS } from './shared/constants';
import {
	CountriesTab,
	MapTab,
	MeasuresTab,
	RegionsTab,
	TimelineTab,
} from './widgets';

function App({ doi }: { doi: Doi }) {
	const isValid = isValidDoi(doi);
	const { error, refetch } = useMetaData(doi);

	const [isInfoOpen, setIsInfoOpen] = useState(false);

	if (!isValid) {
		return (
			<Wrapper>
				<div className="flex items-center justify-center h-full">
					Invalid DOI
				</div>
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
					metaData={{
						chapters: [],
						book: { doi, title: '', type: '', ordinal: 0 },
					}}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<MapTab
					metaData={{
						chapters: [],
						book: { doi, title: '', type: '', ordinal: 0 },
					}}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<RegionsTab
					metaData={{
						chapters: [],
						book: { doi, title: '', type: '', ordinal: 0 },
					}}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<CountriesTab
					metaData={{
						chapters: [],
						book: { doi, title: '', type: '', ordinal: 0 },
					}}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<TabsList className="w-full">
					<TabsTrigger value={TABS.MEASURES}>
						<ChartBar /> Measures
					</TabsTrigger>
					<TabsTrigger value={TABS.TIMELINE}>
						<ChartLine /> Timeline
					</TabsTrigger>
					<TabsTrigger value={TABS.MAP}>
						<MapIcon /> Map
					</TabsTrigger>
					<TabsTrigger value={TABS.REGIONS}>
						<Globe /> Regions
					</TabsTrigger>
					<TabsTrigger value={TABS.COUNTRIES}>
						<Earth />
						Countries
					</TabsTrigger>
				</TabsList>
			</Tabs>
		</Wrapper>
	);
}

export default App;
