'use client';

import { createContext } from 'react';
import MetaService from '../services/metaService';
import MetricsService from '../services/metricsService';

export type ServicesMap = {
	metaService: MetaService;
	metricsService: MetricsService;
};

export const defaultServices: ServicesMap = {
	metaService: new MetaService(),
	metricsService: new MetricsService(),
};

export const ServicesContext = createContext({
	...defaultServices,
});
