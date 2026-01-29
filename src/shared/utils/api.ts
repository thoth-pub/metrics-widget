export const getDateYearAgo = (date: Date = new Date()): Date => {
	const yearAgo = new Date(date);

	yearAgo.setFullYear(yearAgo.getFullYear() - 1);

	return yearAgo;
};

export const formatDateToApiFormat = (date: Date = new Date()): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};
