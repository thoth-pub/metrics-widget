'use client';

import { createContext } from 'react';
import MetaService from '../services/metaService';
import MetricWidgetService from '../services/metricWidgetService';

export type ServicesMap = {
	metaService: MetaService;
	metricWidgetService: MetricWidgetService;
};

export const defaultServices: ServicesMap = {
	metaService: new MetaService(),
	metricWidgetService: new MetricWidgetService(),
};

export const ServicesContext = createContext({
	...defaultServices,
});
