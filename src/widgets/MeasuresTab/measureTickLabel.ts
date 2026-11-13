/**
 * The most characters of one drawn line of a Measures axis label. In the axis's 12 px Open Sans, 20 characters of
 * ordinary text take about 125 to 145 px of the 152 px left of the tick (160 px axis), and the ID suffix of spec 7.1.2
 * (`[xxxxxxxx/yyyyyyyy]`, 19 characters) fits on a line of its own. The tooltip always shows the full label.
 */
export const MEASURE_TICK_LINE_LIMIT = 20;

const ELLIPSIS = '…';
const SEPARATOR = ' · ';

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

/** The spec 7.1.2 ID suffix of a pair, without its leading space: `[<first 8 of platformId>/<first 8 of measureId>]`. */
const tagOf = (key: string) => {
	const [platformId = '', measureId = ''] = key.split('/');

	return `[${platformId.slice(0, 8)}/${measureId.slice(0, 8)}]`;
};

/** A part of a drawn label and the most characters it may take. */
type Slot = { text: string; room: number };

/** How a label too long to stay whole is drawn: its parts, how they make lines, and how a tag is added. */
type Layout = {
	slots: Slot[];
	lines: (drawn: string[]) => string[];
	tagged: (drawn: string[], tag: string) => string[];
};

/** The platform and the measure on a line each, and the ID suffix (if any) on a third. */
const linesLayout = (pair: MeasureTickPair, limit: number): Layout => {
	const suffix = suffixOf(pair);

	return {
		slots: [
			{ text: pair.platformName, room: limit },
			{ text: pair.measureName, room: limit },
			...(suffix ? [{ text: suffix, room: limit }] : []),
		],
		lines: (drawn) => drawn,
		tagged: (drawn, tag) => [drawn[0], drawn[1], tag],
	};
};

type Entry = {
	pair: MeasureTickPair;
	/** `null` for a label drawn whole. */
	layout: Layout | null;
	drawn: string[];
	lines: string[];
};

/** The entries drawn alike, in groups of two or more. */
const collidingGroups = (entries: Entry[]) => {
	const byText = new Map<string, Entry[]>();

	for (const entry of entries) {
		const text = entry.lines.join('\n');
		byText.set(text, [...(byText.get(text) ?? []), entry]);
	}

	return [...byText.values()].filter((group) => group.length > 1);
};

/**
 * Draws every label with one layout, keeping the labels of distinct pairs distinct:
 * 1. a label that fits stays whole; each part of a longer one that does not fit keeps its start and ends with "…";
 * 2. where labels are still drawn alike, a part that is drawn alike but differs in full keeps its start and its end
 *    instead (`Open Book…DF Reader`); every other part stays as in step 1;
 * 3. labels still drawn alike get the spec 7.1.2 ID suffix.
 */
const drawLabels = (
	pairs: readonly MeasureTickPair[],
	layoutOf: (pair: MeasureTickPair) => Layout,
	limit: number,
) => {
	const entries: Entry[] = pairs.map((pair) => {
		if (pair.label.length <= limit) {
			return { pair, layout: null, drawn: [], lines: [pair.label] };
		}

		const layout = layoutOf(pair);
		const drawn = layout.slots.map(({ text, room }) => capEnd(text, room));

		return { pair, layout, drawn, lines: layout.lines(drawn) };
	});

	for (const group of collidingGroups(entries)) {
		const shaped = group.filter(
			(entry): entry is Entry & { layout: Layout } => entry.layout !== null,
		);
		const slotCount = Math.max(0, ...shaped.map(({ drawn }) => drawn.length));

		for (let index = 0; index < slotCount; index++) {
			const byDrawn = new Map<string, typeof shaped>();

			for (const entry of shaped) {
				const drawn = entry.drawn[index];
				if (drawn === undefined) continue;
				byDrawn.set(drawn, [...(byDrawn.get(drawn) ?? []), entry]);
			}

			for (const alike of byDrawn.values()) {
				const texts = new Set(
					alike.map(({ layout }) => layout.slots[index].text),
				);
				if (texts.size < 2) continue;

				for (const entry of alike) {
					const { text, room } = entry.layout.slots[index];
					entry.drawn[index] = capMiddle(text, room);
				}
			}
		}

		for (const entry of shaped) entry.lines = entry.layout.lines(entry.drawn);
	}

	for (const group of collidingGroups(entries)) {
		for (const entry of group) {
			if (entry.layout) {
				entry.lines = entry.layout.tagged(entry.drawn, tagOf(entry.pair.key));
			}
		}
	}

	return new Map(entries.map(({ pair, lines }) => [pair.label, lines]));
};

/**
 * The drawn lines of each Measures axis label, by label. Each line holds at most `limit` characters, a part that fits
 * is never shortened, and the labels of distinct pairs are drawn differently (see `drawLabels`).
 */
export const measureTickLines = (
	pairs: readonly MeasureTickPair[],
	limit = MEASURE_TICK_LINE_LIMIT,
) => drawLabels(pairs, (pair) => linesLayout(pair, limit), limit);
