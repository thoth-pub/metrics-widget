'use client';

import { createContext } from 'react';

export const PortalContainerContext = createContext<HTMLDivElement | null>(
	null,
);
