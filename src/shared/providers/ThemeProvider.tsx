import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ThemeContext } from '../context';
import {
  type MetricsWidgetTheme,
  type MetricsWidgetTokenName,
  NON_COLOR_TOKENS,
} from '../interfaces';
import { isValidColor } from '../utils';

type ThemeProviderProps = {
	theme?: MetricsWidgetTheme | null;
	children: Readonly<React.ReactNode>;
};

const applyTheme = (
	appliedKeys: Set<string>,
	next: MetricsWidgetTheme | null,
) => {
	if (typeof document === 'undefined' || !next) return;

	const root = document.documentElement;

	for (const [key, value] of Object.entries(next)) {
		if (!value) {
			root.style.removeProperty(`--${key}`);
			appliedKeys.delete(key);
			continue;
		}

		const isColorToken = !NON_COLOR_TOKENS.has(key as MetricsWidgetTokenName);

		if (isColorToken && !isValidColor(value)) {
			continue;
		}

		root.style.setProperty(`--${key}`, value);
		appliedKeys.add(key);
	}
};

const clearAppliedKeys = (appliedKeys: Set<string>) => {
	if (typeof document === 'undefined') return;

	const root = document.documentElement;

	for (const key of appliedKeys) {
		root.style.removeProperty(`--${key}`);
	}

	appliedKeys.clear();
};

export const ThemeProvider = ({ theme, children }: ThemeProviderProps) => {
	const appliedKeysRef = useRef<Set<string>>(new Set());
	const newTheme = theme ?? null;
	const [themeApplied, setThemeApplied] = useState(false);

	useLayoutEffect(() => {
		applyTheme(appliedKeysRef.current, newTheme);
		setThemeApplied(true);
	}, [newTheme]);

	useEffect(() => {
		const keys = appliedKeysRef.current;
		return () => {
			clearAppliedKeys(keys);
		};
	}, []);

	const value = useMemo(
		() => ({ theme: newTheme, themeApplied }),
		[themeApplied, newTheme],
	);

	return <ThemeContext value={value}>{children}</ThemeContext>;
};
