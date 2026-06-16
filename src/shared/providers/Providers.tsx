import type { MetricsWidgetTheme } from '../interfaces';
import { ChaptersProvider } from './ChaptersProvider';
import { QueryClientProvider } from './QueryClient';
import { ServicesProvider } from './ServicesProvider';
import { ThemeProvider } from './ThemeProvider';

type ProvidersProps = {
	children: Readonly<React.ReactNode>;
	theme?: MetricsWidgetTheme | null;
};

const Providers = ({ children, theme }: ProvidersProps) => {
	return (
		<QueryClientProvider>
			<ServicesProvider>
				<ChaptersProvider>
					<ThemeProvider theme={theme}>{children}</ThemeProvider>
				</ChaptersProvider>
			</ServicesProvider>
		</QueryClientProvider>
	);
};

export default Providers;
