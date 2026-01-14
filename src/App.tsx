import type { Doi } from '@/shared';
import { NoDataPlaceholder } from '@/shared/ui';
import { useMetricsByYear } from './shared/hooks';
import { normalizeDoi } from './shared/utils';

function App({ doi }: { doi: Doi }) {
	const { data, isLoading, error } = useMetricsByYear(doi);

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
		<div className="max-w-[630px] w-full h-[500px] mx-auto bg-background">
			<h1 className="text-3xl font-bold underline">
				Metrics Widget. Doi is valid: {normalizeDoi(doi)}
			</h1>
		</div>
	);
}

export default App;
