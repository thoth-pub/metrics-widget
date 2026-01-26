import { type Doi, isValidDoi } from '@/shared';
import {
	ContentTab,
	NoDataPlaceholder,
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
import { useMetricsByYear } from './shared/hooks';

function App({ doi }: { doi: Doi }) {
	const isValid = isValidDoi(doi);
	const { data, isLoading, error } = useMetricsByYear(doi);

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

	if (!data) {
		return <NoDataPlaceholder />;
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
				<ContentTab
					value="measures"
					title="Usage by measure"
					isInfoOpen={isInfoOpen}
					onToggleInfo={toggleInfo}
				>
					Measures
				</ContentTab>
				<ContentTab
					value="timeline"
					className="bg-blue-500"
					title="Usage by measure over time"
					isInfoOpen={isInfoOpen}
					onToggleInfo={toggleInfo}
				>
					Timeline
				</ContentTab>
				<ContentTab
					value="map"
					className="bg-green-500"
					title="Geographical Usage"
					isInfoOpen={isInfoOpen}
					onToggleInfo={toggleInfo}
				>
					Map
				</ContentTab>
				<ContentTab
					value="regions"
					className="bg-yellow-500"
					title="Continent Usage"
					isInfoOpen={isInfoOpen}
					onToggleInfo={toggleInfo}
				>
					Regions
				</ContentTab>
				<ContentTab
					value="countries"
					className="bg-purple-500"
					title="Top 10 countries"
					isInfoOpen={isInfoOpen}
					onToggleInfo={toggleInfo}
				>
					Countries
				</ContentTab>
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
