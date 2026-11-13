import { act, type ReactNode, useState } from 'react';
import {
	type SelectedChapter,
	SelectedChaptersContext,
} from '@/shared/context';
import type { MetricsWidgetTheme } from '@/shared/interfaces';
import { Providers, ThemeProvider } from '@/shared/providers';
import { QueryClientProvider } from '@/shared/providers/QueryClient';
import { ServicesProvider } from '@/shared/providers/ServicesProvider';

/** Wrapper that mounts the package's own providers (query client, services, theme). */
export const createWrapper = (theme?: MetricsWidgetTheme | null) =>
	function Wrapper({ children }: { children: ReactNode }) {
		return <Providers theme={theme}>{children}</Providers>;
	};

/**
 * The package's providers with the chapter selection under the test's control: `selectChapters` sets it as the
 * chapter dropdown would.
 */
export const createSelectableWrapper = (
	theme?: MetricsWidgetTheme | null,
	initial: SelectedChapter[] = [],
) => {
	let setSelection: (chapters: SelectedChapter[]) => void = () => {};

	function Wrapper({ children }: { children: ReactNode }) {
		const [selectedChapters, setSelectedChapters] = useState(initial);

		setSelection = setSelectedChapters;

		return (
			<QueryClientProvider>
				<ServicesProvider>
					<SelectedChaptersContext
						value={{ selectedChapters, setSelectedChapters }}
					>
						<ThemeProvider theme={theme}>{children}</ThemeProvider>
					</SelectedChaptersContext>
				</ServicesProvider>
			</QueryClientProvider>
		);
	}

	return {
		Wrapper,
		selectChapters: (chapters: SelectedChapter[]) =>
			act(() => setSelection(chapters)),
	};
};
