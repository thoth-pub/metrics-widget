import { createContext, useContext, useState } from 'react';
import { metricWidgetEndDate } from '../metricWidget';

/**
 * The `E` of one widget instance (the first day of the month after the current UTC month), computed once by `App`
 * when it mounts. Every tab reads it from here, so tabs mounted on either side of a UTC month boundary share one
 * R-YEAR key, and so one read.
 */
export const MetricWidgetEndDateContext = createContext<string | null>(null);

/** Computes `E` once for the life of the calling component (the widget root). */
export const useNewMetricWidgetEndDate = () => {
	const [endDate] = useState(() => metricWidgetEndDate(new Date()));

	return endDate;
};

/** The widget's `E`; outside a widget root (a hook rendered on its own), `E` fixed for the calling component. */
export const useMetricWidgetEndDate = () => {
	const shared = useContext(MetricWidgetEndDateContext);
	const own = useNewMetricWidgetEndDate();

	return shared ?? own;
};
