import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '../..');

describe('MetricsWidgetTheme type', () => {
	it('accepts font, case and any chart-metric key, and rejects misspelt keys', () => {
		const configPath = resolve(projectRoot, 'tests/tsconfig.json');
		const config = ts.getParsedCommandLineOfConfigFile(
			configPath,
			{
				noEmit: true,
				incremental: false,
				composite: false,
				tsBuildInfoFile: undefined,
			},
			{ ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
		);
		const program = ts.createProgram({
			rootNames: [resolve(projectRoot, 'tests/theme/themeTypes.typecheck.ts')],
			options: config?.options ?? {},
		});
		const diagnostics = ts
			.getPreEmitDiagnostics(program)
			.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));

		expect(config).toBeDefined();
		expect(diagnostics).toEqual([]);
	}, 60_000);
});
