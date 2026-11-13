import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	buildSchema,
	Kind,
	type OperationDefinitionNode,
	parse,
	validate,
	visit,
} from 'graphql';
import { describe, expect, it } from 'vitest';
import { METRIC_WIDGET_QUERY } from '@/shared/services/metricWidgetService';

const schema = buildSchema(
	readFileSync(
		join(__dirname, '../fixtures/metricWidget.schema.graphql'),
		'utf8',
	),
);

const document = parse(METRIC_WIDGET_QUERY);

describe('the metricWidget GraphQL document (contract at thoth da3e15a3)', () => {
	it('parses and validates against the schema fixture', () => {
		expect(validate(schema, document)).toEqual([]);
	});

	it('is one operation with one root field and no spread or inline fragment around it', () => {
		const operations = document.definitions.filter(
			(definition): definition is OperationDefinitionNode =>
				definition.kind === Kind.OPERATION_DEFINITION,
		);

		expect(operations).toHaveLength(1);
		expect(operations[0].name?.value).toBe('MetricWidget');
		expect(operations[0].selectionSet.selections).toHaveLength(1);
		expect(operations[0].selectionSet.selections[0]).toMatchObject({
			kind: Kind.FIELD,
			name: { value: 'metricWidget' },
		});
	});

	it('selects no institution, warning, coverage, dataThrough, isPartial, asOf or rollupWatermark field', () => {
		const fields = new Set<string>();

		visit(document, {
			Field(node) {
				fields.add(node.name.value);
			},
		});

		for (const field of [
			'institutions',
			'warnings',
			'coverage',
			'countryCoverage',
			'status',
			'dataThrough',
			'isPartial',
			'asOf',
			'rollupWatermark',
		]) {
			expect(fields.has(field)).toBe(false);
		}
	});

	it('declares the grain default as MONTH and the start date as optional', () => {
		const input = schema.getType('MetricWidgetInput');

		expect(input?.toJSON()).toBe('MetricWidgetInput');
		expect(
			// biome-ignore lint/suspicious/noExplicitAny: graphql-js input field map
			(input as any).getFields().timelineGrain.defaultValue,
		).toBe('MONTH');
		expect(
			// biome-ignore lint/suspicious/noExplicitAny: graphql-js input field map
			String((input as any).getFields().startDate.type),
		).toBe('Date');
	});
});
