import iso from 'iso-3166-1';

// Country names and regions, as the metrics dashboard defines them (`utils/thothSeries.ts`, DASH-02D). Country
// rows are matched by ISO 3166-1 alpha-2 code, never by name.

/**
 * Display names for codes the ISO 3166-1 library leaves ambiguous or does not list: it names both CD and CG
 * "Congo", and Thoth may report Kosovo under the user-assigned code XK.
 */
const COUNTRY_NAME_OVERRIDES: Readonly<Record<string, string>> = {
	CD: 'Democratic Republic of the Congo',
	CG: 'Republic of the Congo',
	XK: 'Kosovo',
};

export const countryName = (countryCode: string) =>
	COUNTRY_NAME_OVERRIDES[countryCode] ??
	iso.whereAlpha2(countryCode)?.country ??
	countryCode;

/**
 * Map geography names (`WorldMap/geoData.json`) that the ISO 3166-1 library does not resolve, or resolves
 * ambiguously, with the code each stands for. The display overrides above resolve back to their codes too.
 */
const CODE_BY_NAME: ReadonlyMap<string, string> = new Map([
	['Brunei', 'BN'],
	['Congo', 'CG'],
	['Czechia', 'CZ'],
	['Democratic Republic of Congo', 'CD'],
	['Eswatini', 'SZ'],
	['Iran', 'IR'],
	['Laos', 'LA'],
	['Micronesia (country)', 'FM'],
	['Moldova', 'MD'],
	['North Macedonia', 'MK'],
	['South Korea', 'KR'],
	['Taiwan', 'TW'],
	['Tanzania', 'TZ'],
	['Timor', 'TL'],
	['Venezuela', 'VE'],
	['West Bank', 'PS'],
	...Object.entries(COUNTRY_NAME_OVERRIDES).map(
		([code, name]) => [name, code] as const,
	),
]);

/**
 * The country code a name stands for: a map geography name, an ISO 3166-1 name, a display name from
 * `countryName`, or a bare two-letter code.
 */
export const countryCodeOf = (name: string): string | undefined =>
	CODE_BY_NAME.get(name) ??
	iso.whereCountry(name)?.alpha2 ??
	(/^[A-Z]{2}$/.test(name) ? name : undefined);

/**
 * UN M49 regions: each lists its ISO 3166-1 alpha-2 codes, separated by spaces, plus `XK` (Kosovo, a
 * user-assigned code in common use) in Southern Europe.
 */
export const CONTINENT_COUNTRIES: Readonly<Record<string, string>> = {
	Africa:
		'DZ EG LY MA SD TN EH IO BI KM DJ ER ET TF KE MG MW MU YT MZ RE RW SC SO SS UG TZ ZM ZW AO CM CF TD CG CD GQ GA ST BW SZ LS NA ZA BJ BF CV CI GM GH GN GW LR ML MR NE NG SH SN SL TG',
	Asia: 'KZ KG TJ TM UZ CN HK MO KP JP MN KR TW BN KH ID LA MY MM PH SG TH TL VN AF BD BT IN IR MV NP PK LK AM AZ BH CY GE IQ IL JO KW LB OM QA SA PS SY TR AE YE',
	Europe:
		'BY BG CZ HU PL MD RO RU SK UA AX DK EE FO FI GG IS IE IM JE LV LT NO SJ SE GB AL AD BA HR GI GR VA IT MT ME MK PT SM RS SI ES XK AT BE FR DE LI LU MC NL CH',
	'Latin America and the Caribbean':
		'AI AG AW BS BB BQ VG KY CU CW DM DO GD GP HT JM MQ MS PR BL KN LC MF VC SX TT TC VI BZ CR SV GT HN MX NI PA AR BO BV BR CL CO EC FK GF GY PY PE GS SR UY VE',
	'Northern America': 'BM CA GL PM US',
	Oceania:
		'AU CX CC HM NZ NF FJ NC PG SB VU GU KI MH FM NR MP PW UM AS CK PF NU PN WS TK TO TV WF',
	Antarctica: 'AQ',
};

export const UNKNOWN_REGION = 'Other or unknown region';

const CONTINENT_BY_COUNTRY: ReadonlyMap<string, string> = new Map(
	Object.entries(CONTINENT_COUNTRIES).flatMap(([continent, codes]) =>
		codes.split(' ').map((code) => [code, continent] as const),
	),
);

export const continentOf = (countryCode: string) =>
	CONTINENT_BY_COUNTRY.get(countryCode) ?? UNKNOWN_REGION;
