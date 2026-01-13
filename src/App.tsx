import type { Doi } from '@/shared';
import { NoDataPlaceholder } from '@/shared/ui';
import { isValidDoi, normalizeDoi } from './shared/utils';

function App({ doi }: { doi: Doi }) {
	const isValid = isValidDoi(doi);

	if (!isValid) {
		return <NoDataPlaceholder />;
	}

	return (
		<h1 className="text-3xl font-bold underline">
			Metrics Widget. Doi is valid: {normalizeDoi(doi)}
		</h1>
	);
}

export default App;
