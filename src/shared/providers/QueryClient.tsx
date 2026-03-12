import {
	QueryClient,
	QueryClientProvider as QueryClientProviderTanstack,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { config } from '../config';

type QueryClientProviderProps = {
	children: Readonly<React.ReactNode>;
};

export const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
	const queryClient = useMemo(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: config.query.staleTime,
					},
				},
			}),
		[],
	);

	return (
		<QueryClientProviderTanstack client={queryClient}>
			{children}
		</QueryClientProviderTanstack>
	);
};
