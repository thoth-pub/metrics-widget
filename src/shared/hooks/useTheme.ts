import { use } from 'react';
import { ThemeContext } from '../context';
import type { MetricsWidgetTheme } from '../interfaces';

export function useTheme(): MetricsWidgetTheme | null {
	return use(ThemeContext).theme;
}

export function useThemeApplied(): boolean {
	return use(ThemeContext).themeApplied;
}
