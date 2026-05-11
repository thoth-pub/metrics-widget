import { use } from 'react';
import { PortalContainerContext } from '../context';

export function usePortalContainer(): HTMLDivElement | undefined {
	return use(PortalContainerContext) ?? undefined;
}
