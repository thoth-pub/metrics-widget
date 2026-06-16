export const getYearDateRange = (year: string = new Date().getFullYear().toString()): { startDate: string; endDate: string } => {
	const yearNum = parseInt(year, 10);
	return {
		startDate: `${yearNum}-01-01`,
		endDate: `${yearNum + 1}-01-01`,
	};
};
