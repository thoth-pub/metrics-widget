import { ChaptersProvider } from './ChaptersProvider';
import { QueryClientProvider } from './QueryClient';
import { ServicesProvider } from './ServicesProvider';

type ProvidersProps = {
	children: Readonly<React.ReactNode>;
};

const Providers = ({ children }: ProvidersProps) => {
	return (
		<QueryClientProvider>
			<ServicesProvider>
				<ChaptersProvider>{children}</ChaptersProvider>
			</ServicesProvider>
		</QueryClientProvider>
	);
};

export default Providers;
