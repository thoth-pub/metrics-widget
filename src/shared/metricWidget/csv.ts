// CSV cells reach `CSVDownloadButton` already escaped; it joins them with `,` as given.

export const NO_DATA_LABEL = 'no data';
export const NOT_APPLICABLE_LABEL = 'n/a';

/**
 * A text cell (platform, measure, section, country, region, label), as the metrics dashboard writes it: quoted
 * when it holds `"`, `,`, CR or LF, and prefixed with `'` when it would otherwise start a spreadsheet formula.
 */
export const csvTextCell = (text: string) => {
	const safe = /^\s*[=+\-@]|^[\t\r]/.test(text) ? `'${text}` : text;

	return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/**
 * A value cell, written unguarded: the exact value, `no data` for an unknown (`null`) value, and an empty cell
 * for a pair the section does not serve (`undefined`).
 */
export const csvValueCell = (value: string | null | undefined) => {
	if (value === undefined) return '';

	return value === null ? NO_DATA_LABEL : value;
};
