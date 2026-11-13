import { roundPercentage } from '../utils/data';
import { countryName, continentOf } from './countries';
import { csvTextCell, NOT_APPLICABLE_LABEL } from './csv';
import type { MetricWidgetView } from './view';

// The Map, Regions and Countries tabs show one combined distribution (DASH-02D): for each country, the exact sum
// of its values over every served pair in both sections. One deliberate departure from the dashboard: a pair is
// named as having no country breakdown from its rows alone, never from `countryCoverage`, which the widget does
// not request (register section 4.4: `countryCoverage: false` never means a pair has no country breakdown).

export type CountryValue = {
	countryCode: string;
	countryName: string;
	value: string;
};

const ZERO = BigInt(0);

const compareBigIntDesc = (a: string, b: string) => {
	const difference = BigInt(b) - BigInt(a);

	if (difference === ZERO) return 0;

	return difference > ZERO ? 1 : -1;
};

/** Every country's exact value summed across pairs and sections, largest first. */
export const combinedCountries = (view: MetricWidgetView): CountryValue[] => {
	const sums = new Map<string, bigint>();

	for (const section of view.sections) {
		for (const { countryCode, value } of section.countries) {
			sums.set(countryCode, (sums.get(countryCode) ?? ZERO) + BigInt(value));
		}
	}

	return [...sums.entries()]
		.map(([countryCode, value]) => ({
			countryCode,
			countryName: countryName(countryCode),
			value: value.toString(),
		}))
		.sort(
			(a, b) =>
				compareBigIntDesc(a.value, b.value) ||
				a.countryName.localeCompare(b.countryName, 'en'),
		);
};

/** The exact sum of the combined country values. */
export const countriesTotal = (countries: CountryValue[]) =>
	countries.reduce((sum, { value }) => sum + BigInt(value), ZERO).toString();

/**
 * The note under each geography chart: every pair whose total in a section is known and non-zero but which has no
 * country row in that section, named with that section (no suffix for a chapter embed). `null` when there is none.
 */
export const noCountryBreakdownNote = (view: MetricWidgetView) => {
	const named: string[] = [];

	for (const pair of view.pairs) {
		for (const section of view.sections) {
			const total = section.totals.get(pair.key);

			if (total === undefined || total === null || BigInt(total) === ZERO) {
				continue;
			}

			const hasCountryRow = section.countries.some(
				({ platformId, measureId }) =>
					platformId === pair.platformId && measureId === pair.measureId,
			);

			if (hasCountryRow) continue;

			named.push(
				view.isChapterEmbed
					? pair.label
					: `${pair.label} (${section.id === 'work' ? 'book' : 'chapters'})`,
			);
		}
	}

	return named.length === 0
		? null
		: `No country breakdown for: ${named.join(', ')}.`;
};

export const NO_COUNTRY_VALUES_TEXT =
	'There are no country values for this work.';

export type SharesProblem = { title: string; description: string };

/**
 * Why the combined values cannot be drawn as shares of a whole, or `null` when they can: a negative value, or a
 * sum of 0. The tabs then show this instead of a chart, and the CSV gives the values with the share `n/a`.
 */
export const sharesProblem = (
	countries: CountryValue[],
): SharesProblem | null => {
	if (countries.some(({ value }) => BigInt(value) < ZERO)) {
		return {
			title: 'Shares cannot be shown',
			description:
				'Some country values for this work are negative, so they cannot be drawn as shares. The CSV export has the exact values.',
		};
	}

	if (countries.length > 0 && BigInt(countriesTotal(countries)) === ZERO) {
		return {
			title: 'Shares cannot be shown',
			description:
				'Every country value for this work is 0, so there are no shares to draw. The CSV export has the values.',
		};
	}

	return null;
};

/** A value's share of the total, in percent, for drawing. */
export const sharePercentage = (value: string, total: string) =>
	BigInt(total) === ZERO ? 0 : (Number(value) / Number(total)) * 100;

export type ContinentValue = { continent: string; value: string };

/** Exact region sums of the combined country values, largest first. */
export const continentValues = (
	countries: CountryValue[],
): ContinentValue[] => {
	const sums = new Map<string, bigint>();

	for (const { countryCode, value } of countries) {
		const continent = continentOf(countryCode);

		sums.set(continent, (sums.get(continent) ?? ZERO) + BigInt(value));
	}

	return [...sums.entries()]
		.map(([continent, value]) => ({ continent, value: value.toString() }))
		.sort(
			(a, b) =>
				compareBigIntDesc(a.value, b.value) ||
				a.continent.localeCompare(b.continent, 'en'),
		);
};

const shareCell = (countries: CountryValue[]) => {
	const total = countriesTotal(countries);
	const notApplicable = sharesProblem(countries) !== null;

	return (value: string) =>
		notApplicable
			? NOT_APPLICABLE_LABEL
			: roundPercentage(sharePercentage(value, total));
};

/** `Country, Value, Percentage`: every country (Map and Countries tabs). */
export const countriesCsv = (countries: CountryValue[]): string[][] => {
	const share = shareCell(countries);

	return [
		['Country', 'Value', 'Percentage'],
		...countries.map(({ countryName, value }) => [
			csvTextCell(countryName),
			value,
			share(value),
		]),
	];
};

/** `Region, Value, Percentage`. */
export const regionsCsv = (countries: CountryValue[]): string[][] => {
	const share = shareCell(countries);

	return [
		['Region', 'Value', 'Percentage'],
		...continentValues(countries).map(({ continent, value }) => [
			csvTextCell(continent),
			value,
			share(value),
		]),
	];
};
