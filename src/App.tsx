import { type Doi, isValidDoi } from '@/shared';
import {
	NoDataPlaceholder,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/shared/ui';
import {
	ChartBar,
	ChartLine,
	Earth,
	Globe,
	Map as MapIcon,
} from 'lucide-react';
import { useMetricsByYear } from './shared/hooks';

function App({ doi }: { doi: Doi }) {
	const isValid = isValidDoi(doi);
	const { data, isLoading, error } = useMetricsByYear(doi);

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

	return (
		<div className="max-w-[630px] flex flex-col w-full h-[490px] mx-auto bg-background">
			<div className="h-12.5 bg-background-alt" />
			<Tabs defaultValue="measures" className="h-full">
				<TabsContent value="measures" className="bg-red-500">
					<h1 className="text-2xl font-bold">Measures</h1>
				</TabsContent>
				<TabsContent value="timeline" className="bg-blue-500">
					<h1 className="text-2xl font-bold">Timeline</h1>
				</TabsContent>
				<TabsContent value="map" className="bg-green-500">
					<h1 className="text-2xl font-bold">Map</h1>
				</TabsContent>
				<TabsContent value="regions" className="bg-yellow-500">
					<h1 className="text-2xl font-bold">Regions</h1>
				</TabsContent>
				<TabsContent value="countries" className="bg-purple-500">
					<h1 className="text-2xl font-bold">Countries</h1>
				</TabsContent>
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
		</div>
	);
}

export default App;
