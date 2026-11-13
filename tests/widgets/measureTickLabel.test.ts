import { describe, expect, it } from 'vitest';
import {
	MEASURE_TICK_LINE_LIMIT,
	type MeasureTickPair,
	measureTickLines,
} from '@/widgets/MeasuresTab/measureTickLabel';

const PLATFORM_A = '0a0a0a0a-0000-4000-8000-000000000001';
const PLATFORM_B = '0b0b0b0b-0000-4000-8000-000000000002';
const PLATFORM_C = '0c0c0c0c-0000-4000-8000-000000000003';
const DOWNLOADS = '1d1d1d1d-0000-4000-8000-000000000001';
const VIEWS = '1e1e1e1e-0000-4000-8000-000000000002';

const pair = (
	platformId: string,
	measureId: string,
	platformName: string,
	measureName: string,
	suffix = '',
): MeasureTickPair => ({
	key: `${platformId}/${measureId}`,
	label: `${platformName} · ${measureName}${suffix}`,
	platformName,
	measureName,
});

const drawn = (lines: Map<string, string[]>) => [...lines.values()];

const expectEveryLineWithinTheLimit = (lines: Map<string, string[]>) => {
	for (const line of drawn(lines).flat()) {
		expect(line.length).toBeLessThanOrEqual(MEASURE_TICK_LINE_LIMIT);
	}
};

const expectDistinct = (lines: Map<string, string[]>) => {
	const texts = drawn(lines).map((value) => value.join('\n'));

	expect(new Set(texts).size).toBe(texts.length);
};

describe('Measures axis labels', () => {
	it('leaves a label that fits unchanged, on one line ("OAPEN · Downloads")', () => {
		const lines = measureTickLines([
			pair(PLATFORM_A, DOWNLOADS, 'OAPEN', 'Downloads'),
		]);

		expect(lines.get('OAPEN · Downloads')).toEqual(['OAPEN · Downloads']);
	});

	it('leaves a label of exactly the limit on one line, and splits one a character longer', () => {
		const atLimit = pair(PLATFORM_A, VIEWS, 'OAPEN Books', 'Visits');
		const overLimit = pair(PLATFORM_A, VIEWS, 'OAPEN Library', 'Views');

		expect(atLimit.label).toHaveLength(MEASURE_TICK_LINE_LIMIT);
		expect(overLimit.label).toHaveLength(MEASURE_TICK_LINE_LIMIT + 1);
		expect(measureTickLines([atLimit]).get(atLimit.label)).toEqual([
			'OAPEN Books · Visits',
		]);
		expect(measureTickLines([overLimit]).get(overLimit.label)).toEqual([
			'OAPEN Library',
			'Views',
		]);
	});

	it('never shortens a part that fits: a short platform keeps its whole name', () => {
		const label = pair(
			PLATFORM_A,
			DOWNLOADS,
			'OAPEN',
			'Chapter downloads from the library',
		);
		const [platform, measure] =
			measureTickLines([label]).get(label.label) ?? [];

		expect(platform).toBe('OAPEN');
		expect(measure).toBe('Chapter downloads f…');
	});

	it('draws two platforms with a common prefix and the same measure differently', () => {
		const html = pair(
			PLATFORM_A,
			VIEWS,
			'Open Book Publishers HTML Reader',
			'Views',
		);
		const pdf = pair(
			PLATFORM_B,
			VIEWS,
			'Open Book Publishers PDF Reader',
			'Views',
		);
		const lines = measureTickLines([html, pdf]);

		expect(lines.get(html.label)).toEqual(['Open Book…ML Reader', 'Views']);
		expect(lines.get(pdf.label)).toEqual(['Open Book…DF Reader', 'Views']);
		expectDistinct(lines);
		expectEveryLineWithinTheLimit(lines);
	});

	it('keeps the start of a long line when no other label is drawn alike', () => {
		const downloads = pair(
			PLATFORM_B,
			DOWNLOADS,
			'Open Book Publishers PDF Reader',
			'Downloads',
		);
		const views = pair(
			PLATFORM_B,
			VIEWS,
			'Open Book Publishers PDF Reader',
			'Views',
		);
		const lines = measureTickLines([downloads, views]);

		expect(lines.get(downloads.label)).toEqual([
			'Open Book Publisher…',
			'Downloads',
		]);
		expect(lines.get(views.label)).toEqual(['Open Book Publisher…', 'Views']);
	});

	it('adds the spec 7.1.2 ID suffix when even the ends of their lines are alike', () => {
		const a = pair(
			PLATFORM_A,
			VIEWS,
			'Open Book Publishers Reader (beta 1) for the web',
			'Views',
		);
		const b = pair(
			PLATFORM_B,
			VIEWS,
			'Open Book Publishers Reader (beta 2) for the web',
			'Views',
		);
		const lines = measureTickLines([a, b]);

		expect(lines.get(a.label)).toEqual([
			'Open Book…r the web',
			'Views',
			'[0a0a0a0a/1e1e1e1e]',
		]);
		expect(lines.get(b.label)).toEqual([
			'Open Book…r the web',
			'Views',
			'[0b0b0b0b/1e1e1e1e]',
		]);
		expectDistinct(lines);
		expectEveryLineWithinTheLimit(lines);
	});

	it('middle-shortens only the line that collides; a measure line drawn alike in full keeps its end-shortening', () => {
		const measure = 'Total item investigations';
		const html = pair(
			PLATFORM_A,
			VIEWS,
			'Open Book Publishers HTML Reader',
			measure,
		);
		const pdf = pair(
			PLATFORM_B,
			VIEWS,
			'Open Book Publishers PDF Reader',
			measure,
		);
		const oapen = pair(PLATFORM_C, VIEWS, 'OAPEN', measure);
		const lines = measureTickLines([html, pdf, oapen]);

		expect(lines.get(html.label)).toEqual([
			'Open Book…ML Reader',
			'Total item investig…',
		]);
		expect(lines.get(pdf.label)).toEqual([
			'Open Book…DF Reader',
			'Total item investig…',
		]);
		expect(lines.get(oapen.label)).toEqual(['OAPEN', 'Total item investig…']);
		expectDistinct(lines);
	});

	it('middle-shortens a measure line that collides and leaves the shared platform line as it is', () => {
		const total = pair(
			PLATFORM_A,
			DOWNLOADS,
			'Open Book Publishers PDF Reader',
			'Total item investigations',
		);
		const unique = pair(
			PLATFORM_A,
			VIEWS,
			'Open Book Publishers PDF Reader',
			'Total item investigations (unique)',
		);
		const lines = measureTickLines([total, unique]);

		expect(lines.get(total.label)).toEqual([
			'Open Book Publisher…',
			'Total item…tigations',
		]);
		expect(lines.get(unique.label)).toEqual([
			'Open Book Publisher…',
			'Total item…(unique)',
		]);
		expectDistinct(lines);
	});

	it('draws the spec ID suffix of two pairs sharing one label on a line of its own', () => {
		const a = pair(
			PLATFORM_B,
			VIEWS,
			'Open Book Publishers',
			'Views',
			' [0b0b0b0b/1e1e1e1e]',
		);
		const b = pair(
			PLATFORM_C,
			VIEWS,
			'Open Book Publishers',
			'Views',
			' [0c0c0c0c/1e1e1e1e]',
		);
		const lines = measureTickLines([a, b]);

		expect(lines.get(a.label)).toEqual([
			'Open Book Publishers',
			'Views',
			'[0b0b0b0b/1e1e1e1e]',
		]);
		expectDistinct(lines);
		expectEveryLineWithinTheLimit(lines);
	});

	it('keeps every drawn line within the limit, for long platform and measure names alike', () => {
		const lines = measureTickLines([
			pair(PLATFORM_A, DOWNLOADS, 'OAPEN', 'Downloads'),
			pair(PLATFORM_B, DOWNLOADS, 'Open Book Publishers', 'Downloads'),
			pair(PLATFORM_B, VIEWS, 'Open Book Publishers', 'Views'),
			pair(
				PLATFORM_C,
				VIEWS,
				'A platform with a very long display name indeed',
				'A measure with a very long display name too',
			),
		]);

		expectEveryLineWithinTheLimit(lines);
		expectDistinct(lines);
	});
});
