import type { TABS } from '../constants';

export type Tab = (typeof TABS)[keyof typeof TABS];

export type TabProps = {
	isInfoOpen: boolean;
	toggleInfo: () => void;
};
