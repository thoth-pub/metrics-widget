import {
	combinedCountries,
	type Doi,
	NO_COUNTRY_VALUES_TEXT,
	noCountryBreakdownNote,
	sharesProblem,
	useMetricWidgetYear,
	viewCaptions,
} from '@/shared';

/** The combined country distribution of R-YEAR that the Map, Regions and Countries tabs share. */
export const useGeography = (doi: Doi) => {
	const year = useMetricWidgetYear(doi);
	const view = year.view && !year.view.isEmpty ? year.view : null;
	const countries = view ? combinedCountries(view) : [];
	const note = view ? noCountryBreakdownNote(view) : null;

	return {
		year,
		countries,
		/** Why shares cannot be drawn (a negative value or a sum of 0), or `null`. */
		problem: sharesProblem(countries),
		/** The text shown instead of a chart when there is no country row at all, or `null`. */
		emptyText: view && countries.length === 0 ? NO_COUNTRY_VALUES_TEXT : null,
		/** The captions above the chart and the notes under it. */
		captions: view ? viewCaptions(view) : [],
		notes: note ? [note] : [],
	};
};
