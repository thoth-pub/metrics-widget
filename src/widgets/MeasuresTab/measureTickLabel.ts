/**
 * The most characters of one drawn line of a Measures axis label. In the axis's 12 px Open Sans, 20 characters of
 * ordinary text take about 125 to 145 px of the 152 px left of the tick (160 px axis), and the ID suffix of spec 7.1.2
 * (`[xxxxxxxx/yyyyyyyy]`, 19 characters) fits on a line of its own. The tooltip always shows the full label.
 */
export const MEASURE_TICK_LINE_LIMIT = 20;

const ELLIPSIS = '…';
const SEPARATOR = ' · ';
const MIN_TAG_ID_CHARS = 4;
const MAX_TAG_ID_CHARS = 8;

export type MeasureTickPair = {
	/** `<platformId>/<measureId>`. */
	key: string;
	/** `<platform> · <measure>`, with the spec 7.1.2 ID suffix when two served pairs share it. */
	label: string;
	platformName: string;
	measureName: string;
};

type Cap = (text: string, limit: number) => string;

/** Keeps the start: `Open Book Publishers PDF Reader` → `Open Book Publisher…`. */
const capEnd: Cap = (text, limit) =>
	text.length <= limit
		? text
		: `${text.slice(0, limit - 1).trimEnd()}${ELLIPSIS}`;

/** Keeps the start and the end: `Open Book Publishers PDF Reader` → `Open Book…DF Reader`. */
const capMiddle: Cap = (text, limit) => {
	if (text.length <= limit) return text;

	const room = limit - ELLIPSIS.length;
	const head = Math.ceil(room / 2);
	const tail = room - head;

	return `${text.slice(0, head).trimEnd()}${ELLIPSIS}${text.slice(text.length - tail).trimStart()}`;
};

const suffixOf = ({ label, platformName, measureName }: MeasureTickPair) => {
	const base = `${platformName}${SEPARATOR}${measureName}`;

	return label.startsWith(base) ? label.slice(base.length).trim() : '';
};

/**
 * One label: unchanged on one line when it fits; otherwise the platform and the measure on a line each, and the ID
 * suffix (if any) on a third. Only a line that does not fit is shortened.
 */
const linesOf = (pair: MeasureTickPair, cap: Cap, limit: number) => {
	if (pair.label.length <= limit) return [pair.label];

	const suffix = suffixOf(pair);

	return [
		cap(pair.platformName, limit),
		cap(pair.measureName, limit),
		...(suffix ? [capEnd(suffix, limit)] : []),
	];
};

const textOf = (lines: string[]) => lines.join('\n');

/** The keys whose drawn lines equal those of another pair. */
const collidingKeys = (lines: Map<string, string[]>) => {
	const keysByText = new Map<string, string[]>();

	for (const [key, value] of lines) {
		const text = textOf(value);
		keysByText.set(text, [...(keysByText.get(text) ?? []), key]);
	}

	return [...keysByText.values()].filter((keys) => keys.length > 1).flat();
};

const tagOf = (key: string, length: number) => {
	const [platformId = '', measureId = ''] = key.split('/');

	return `[${platformId.slice(0, length)}/${measureId.slice(0, length)}]`;
};

/**
 * The drawn lines of each Measures axis label, by label. Each line holds at most `limit` characters, a part that fits
 * is never shortened, and the labels of distinct pairs are drawn differently:
 * 1. each line too long keeps its start and ends with "…";
 * 2. pairs still drawn alike keep the start and the end of each line too long (`Open Book…DF Reader`);
 * 3. pairs still drawn alike get a last line with the shortest ID tag (spec 7.1.2 form, 4 to 8 characters of each
 *    ID) that tells them apart.
 */
export const measureTickLines = (
	pairs: readonly MeasureTickPair[],
	limit = MEASURE_TICK_LINE_LIMIT,
) => {
	const byKey = new Map(pairs.map((pair) => [pair.key, pair]));
	const lines = new Map(
		pairs.map((pair) => [pair.key, linesOf(pair, capEnd, limit)]),
	);

	for (const key of collidingKeys(lines)) {
		const pair = byKey.get(key);
		if (pair) lines.set(key, linesOf(pair, capMiddle, limit));
	}

	const stillColliding = collidingKeys(lines);

	if (stillColliding.length > 0) {
		let length = MIN_TAG_ID_CHARS;

		while (
			length < MAX_TAG_ID_CHARS &&
			new Set(stillColliding.map((key) => tagOf(key, length))).size <
				stillColliding.length
		) {
			length += 1;
		}

		for (const key of stillColliding) {
			const pair = byKey.get(key);
			if (!pair) continue;

			lines.set(key, [
				capMiddle(pair.platformName, limit),
				capMiddle(pair.measureName, limit),
				tagOf(key, length),
			]);
		}
	}

	return new Map(
		pairs.map((pair) => [pair.label, lines.get(pair.key) ?? [pair.label]]),
	);
};
