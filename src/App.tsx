import type { Doi } from './shared';

function App({ doi }: { doi: Doi }) {
	return <h1 className="text-3xl font-bold underline">Metrics Widget {doi}</h1>;
}

export default App;
