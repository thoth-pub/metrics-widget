import {
	QueryClient,
	QueryClientProvider as QueryClientProviderTanstack,
} from '@tanstack/react-query';
import { useMemo } from 'react';

type QueryClientProviderProps = {
	children: Readonly<React.ReactNode>;
};

export const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
	const queryClient = useMemo(() => new QueryClient(), []);

	return (
		<QueryClientProviderTanstack client={queryClient}>
			{children}
		</QueryClientProviderTanstack>
	);
};
