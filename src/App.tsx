import { type Doi, isValidDoi } from '@/shared';
import { Tabs, TabsList, TabsTrigger, Wrapper } from '@/shared/ui';
import {
	ChartBar,
	ChartLine,
	Earth,
	Globe,
	Map as MapIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useMetricsByYear } from './shared/hooks';
import {
	CountriesTab,
	MapTab,
	MeasuresTab,
	RegionsTab,
	TimelineTab,
} from './widgets';

function App({ doi }: { doi: Doi }) {
	const isValid = isValidDoi(doi);
	const { metaData, isLoading, error } = useMetricsByYear(doi);

	const [isInfoOpen, setIsInfoOpen] = useState(false);

	if (!isValid) {
		return <div>Invalid DOI</div>;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	const toggleInfo = () => setIsInfoOpen((prev) => !prev);

	const closeInfo = () => setIsInfoOpen(false);

	return (
		<Wrapper>
			<Tabs
				defaultValue="measures"
				className="h-full"
				onValueChange={closeInfo}
			>
				<MeasuresTab
					metaData={metaData}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<TimelineTab
					metaData={metaData}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<MapTab
					metaData={metaData}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<RegionsTab
					metaData={metaData}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<CountriesTab
					metaData={metaData}
					isInfoOpen={isInfoOpen}
					toggleInfo={toggleInfo}
				/>
				<TabsList className="w-full">
					<TabsTrigger value="measures">
						<ChartBar /> Measures
					</TabsTrigger>
					<TabsTrigger value="timeline">
						<ChartLine /> Timeline
					</TabsTrigger>
					<TabsTrigger value="map">
						<MapIcon /> Map
					</TabsTrigger>
					<TabsTrigger value="regions">
						<Globe /> Regions
					</TabsTrigger>
					<TabsTrigger value="countries">
						<Earth />
						Countries
					</TabsTrigger>
				</TabsList>
			</Tabs>
		</Wrapper>
	);
}

export default App;
