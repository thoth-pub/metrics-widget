'use client';

import { createContext } from 'react';
import type { MetricsWidgetTheme } from '../interfaces';

export type ThemeContextValue = {
	theme: MetricsWidgetTheme | null;
	themeApplied: boolean;
};

export const ThemeContext = createContext<ThemeContextValue>({
	theme: null,
	themeApplied: false,
});
