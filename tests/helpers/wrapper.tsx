import { Providers } from '@/shared/providers';
import type { MetricsWidgetTheme } from '@/shared/interfaces';
import type { ReactNode } from 'react';

/** Wrapper that mounts the package's own providers (query client, services, theme). */
export const createWrapper = (theme?: MetricsWidgetTheme | null) =>
	function Wrapper({ children }: { children: ReactNode }) {
		return <Providers theme={theme}>{children}</Providers>;
	};
