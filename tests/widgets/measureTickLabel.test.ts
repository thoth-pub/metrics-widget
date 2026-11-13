import { describe, expect, it } from 'vitest';
import {
	MEASURE_TICK_LIMIT,
	measureTickLabel,
} from '@/widgets/MeasuresTab/measureTickLabel';

describe('Measures axis labels', () => {
	it('keeps the measure of two pairs of one long-named platform, so their labels differ', () => {
		const downloads = measureTickLabel('Open Book Publishers · Downloads');
		const views = measureTickLabel('Open Book Publishers · Views');

		expect(downloads).toBe('Open... · Downloads');
		expect(views).toBe('Open Book... · Views');
		expect(downloads).not.toBe(views);
	});

	it('leaves a label of exactly the limit unchanged, without "..."', () => {
		const label = 'OAPEN · Downloads 12';

		expect(label).toHaveLength(MEASURE_TICK_LIMIT);
		expect(measureTickLabel(label)).toBe(label);
	});

	it('shortens one character over the limit', () => {
		const label = 'OAPEN Library · Views';

		expect(label).toHaveLength(MEASURE_TICK_LIMIT + 1);
		expect(measureTickLabel(label)).toBe('OAPEN Lib... · Views');
	});

	it('keeps the ID suffix of repeated labels with the measure', () => {
		const a = measureTickLabel(
			'Open Book Publishers · Views [0b0b0b0b/1e1e1e1e]',
		);
		const b = measureTickLabel(
			'Open Book Publishers · Views [0c0c0c0c/1e1e1e1e]',
		);

		expect(a).toBe('Open... · Views [0b0b0b0b/1e1e1e1e]');
		expect(a).not.toBe(b);
	});

	it('cuts a label without a separator at the limit', () => {
		expect(measureTickLabel('A very long label without a separator')).toBe(
			'A very long label wi...',
		);
	});
});
