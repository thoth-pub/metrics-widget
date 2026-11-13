// The source has an import cycle (shared barrel -> context -> services -> shared
// barrel) that only resolves when the barrel is evaluated first, as it is in the
// app. Importing it here keeps every test file independent of its import order.
import '@/shared';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom has no ResizeObserver; Recharts' ResponsiveContainer needs one to mount.
if (typeof globalThis.ResizeObserver === 'undefined') {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.useRealTimers();
	vi.restoreAllMocks();
	document.documentElement.removeAttribute('style');
});
