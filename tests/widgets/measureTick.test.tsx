import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MeasureTick } from '@/widgets/MeasuresTab/MeasureTick';

describe('Measures axis tick', () => {
	it('draws two equal lines of one label without a duplicate-key error', () => {
		const consoleError = vi.spyOn(console, 'error');
		const { container } = render(
			<svg>
				<title>Axis</title>
				<MeasureTick
					x={152}
					y={20}
					payload={{ value: 'Views · Views' }}
					labels={
						new Map([
							['Views · Views', { lines: ['Views', 'Views'], line: 'Views' }],
						])
					}
				/>
			</svg>,
		);

		expect(
			Array.from(container.querySelectorAll('tspan')).map(
				(line) => line.textContent,
			),
		).toEqual(['Views', 'Views']);
		expect(consoleError).not.toHaveBeenCalled();
	});
});
