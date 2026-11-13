import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tsconfigPaths({
			projects: ['./tsconfig.app.json', './tests/tsconfig.json'],
		}),
		react(),
	],
	test: {
		environment: 'jsdom',
		include: ['tests/**/*.test.{ts,tsx}'],
		setupFiles: ['tests/setup.ts'],
		// Pin the API endpoints so tests never depend on a local .env file.
		env: {
			VITE_THOTH_API_URL: 'https://thoth.test/graphql',
		},
	},
});
