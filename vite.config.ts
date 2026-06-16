import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths(),
		react(),
		tailwindcss(),
		dts({
			tsconfigPath: './tsconfig.app.json',
			entryRoot: 'src',
			include: ['src/**/*.ts', 'src/**/*.tsx'],
			exclude: ['src/main.tsx'],
			bundleTypes: true,
			insertTypesEntry: true,
			compilerOptions: {
				noEmit: false,
				declaration: true,
				emitDeclarationOnly: true,
			},
		}),
	],
	define: {
		'process.env.NODE_ENV': JSON.stringify('production'),
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.tsx'),
			name: 'metrics-widget',
			fileName: 'metrics-widget',
			formats: ['es'],
		},
		rollupOptions: {
			external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
		},
		copyPublicDir: true,
		assetsInlineLimit: 0,
	},
	publicDir: 'public',
});
