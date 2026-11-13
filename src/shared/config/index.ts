import { DAY } from '../constants';

export const config = {
	query: {
		staleTime: DAY,
	},
	// The public Thoth GraphQL API: work metadata (`workByDoi`) and metrics (`metricWidget`).
	metaApi: {
		url: import.meta.env.VITE_THOTH_API_URL ?? 'https://api.thoth.pub/graphql',
		itemsPerRequestLimit: 100,
	},
	charts: {
		tickMargin: 8,
		timeMetricsChart: {
			maxYearsPerPage: 15,
		},
		labelSeparator: ' - ',
		timeMetricsChartLabelSeparator: ' · ',
		countriesChart: {
			countriesListLimit: 10,
		},
		timelineChart: {
			defaultChartOpacity: 1,
			inactiveChartOpacity: 0.5,
			activeChartOpacity: 1,
			defaultDotOpacity: 0,
			inactiveDotOpacity: 0,
			activeDotOpacity: 1,
			strokeDasharray: '10 10',
			lineStrokeWidth: 2,
			lineDotStrokeWidth: 1,
			lineDotRadius: 3,
			maxYearsPerPage: 12,
		},
	},
	csv: {
		filename: 'download.csv',
	},
};
