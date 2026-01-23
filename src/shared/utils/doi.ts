import { doi as doiUtils } from 'doi-utils';

export const isValidDoi = (doi: string): boolean => {
	return doiUtils.validate(doi);
};

export const normalizeDoi = (doi: string): string => {
	if (!isValidDoi(doi)) {
		return '';
	}

	return doiUtils.normalize(doi) ?? '';
};

export const buildDoiUrl = (doi: string): string => {
	return doiUtils.buildUrl(doi) ?? '';
};
