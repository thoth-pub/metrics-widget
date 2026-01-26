import type { TABS } from '../constants';

export type Tab = (typeof TABS)[keyof typeof TABS];
