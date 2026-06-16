import { use } from 'react';
import { ServicesContext, type ServicesMap } from '../context';

export function useServices(): ServicesMap {
	const context = use(ServicesContext);

	return context;
}
