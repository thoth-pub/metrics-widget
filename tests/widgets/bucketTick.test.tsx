import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BucketTick, bucketTickLines } from '@/widgets/TimelineTab/BucketTick';

describe('Timeline axis ticks', () => {
	it('split a part-year label into the year and its months, keeping the ")"', () => {
		expect(bucketTickLines('2026 (Jan–Nov)')).toEqual(['2026', '(Jan–Nov)']);
		expect(bucketTickLines('2019 (Mar–Dec)')).toEqual(['2019', '(Mar–Dec)']);
		expect(bucketTickLines('2027 (Jan)')).toEqual(['2027', '(Jan)']);
	});

	it('keep a whole-year or month label on one line', () => {
		expect(bucketTickLines('2025')).toEqual(['2025']);
		expect(bucketTickLines('Nov')).toEqual(['Nov']);
	});

	it('draw each line as a tspan centred on the tick', () => {
		const { container } = render(
			<svg>
				<title>tick</title>
				<BucketTick x={100} y={10} payload={{ value: '2026 (Jan–Nov)' }} />
			</svg>,
		);
		const text = container.querySelector('text');

		expect(text?.getAttribute('text-anchor')).toBe('middle');
		expect(
			[...container.querySelectorAll('tspan')].map((node) => [
				node.textContent,
				node.getAttribute('x'),
			]),
		).toEqual([
			['2026', '100'],
			['(Jan–Nov)', '100'],
		]);
	});
});
