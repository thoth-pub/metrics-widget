import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const rootDir = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), 'metrics-widget-consumer-'));
const npmCache = process.env.CI
	? process.env.npm_config_cache
	: (process.env.npm_config_cache ?? join(tempDir, '.npm-cache'));
const npmEnv = {
	...process.env,
	...(npmCache ? { npm_config_cache: npmCache } : {}),
};

const run = (command, args, options = {}) => {
	execFileSync(command, args, {
		cwd: options.cwd ?? rootDir,
		stdio: 'inherit',
		env: npmEnv,
	});
};

try {
	const packOutput = execFileSync(
		'npm',
		['pack', '--json', '--pack-destination', tempDir],
		{ cwd: rootDir, encoding: 'utf8', env: npmEnv },
	);
	const [packResult] = JSON.parse(packOutput);
	const tarballPath = join(tempDir, packResult.filename);
	const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

	writeFileSync(
		join(tempDir, 'package.json'),
		JSON.stringify(
			{
				private: true,
				type: 'module',
				scripts: {
					build: 'vite build',
					typecheck: 'tsc --noEmit',
				},
				dependencies: {
					[packageJson.name]: `file:${tarballPath}`,
					react: packageJson.peerDependencies.react,
					'react-dom': packageJson.peerDependencies['react-dom'],
				},
				devDependencies: {
					'@types/react': packageJson.devDependencies['@types/react'],
					'@types/react-dom': packageJson.devDependencies['@types/react-dom'],
					typescript: packageJson.devDependencies.typescript,
					vite: packageJson.devDependencies.vite,
				},
			},
			null,
			2,
		),
	);

	mkdirSync(join(tempDir, 'src'));
	writeFileSync(
		join(tempDir, 'index.html'),
		'<div id="root"></div><script type="module" src="/src/main.jsx"></script>\n',
	);
	writeFileSync(
		join(tempDir, 'src/main.jsx'),
		`import React from 'react';
import { createRoot } from 'react-dom/client';
import { MetricsWidget } from 'metrics-widget';
import 'metrics-widget/styles.css';

createRoot(document.getElementById('root')).render(
\t<MetricsWidget doi="10.11647/OBP.0159" />,
);
`,
	);
	writeFileSync(
		join(tempDir, 'tsconfig.json'),
		JSON.stringify(
			{
				compilerOptions: {
					target: 'ES2022',
					module: 'ESNext',
					moduleResolution: 'bundler',
					jsx: 'react-jsx',
					strict: true,
					skipLibCheck: true,
					noEmit: true,
				},
				include: ['src/**/*.tsx'],
			},
			null,
			2,
		),
	);
	writeFileSync(
		join(tempDir, 'src/theme-example.tsx'),
		`import { MetricsWidget, type MetricsWidgetTheme } from 'metrics-widget';
import 'metrics-widget/styles.css';

const brandTheme: MetricsWidgetTheme = {
\t'mw-color-background': '#1a1a1a',
\t'mw-color-typography': '#f5f5f5',
\t'mw-color-active': 'hsl(280, 50%, 60%)',
\t'mw-chart-metric-google-books': '#ff8800',
};

export default function App() {
\treturn <MetricsWidget doi="10.11647/OBP.0067" theme={brandTheme} />;
}
`,
	);

	run('npm', ['install'], { cwd: tempDir });
	run('npm', ['run', 'typecheck'], { cwd: tempDir });
	run('npm', ['run', 'build'], { cwd: tempDir });
} finally {
	rmSync(tempDir, { recursive: true, force: true });
}
