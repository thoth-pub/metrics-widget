import type { TABS } from '../constants';
import type { Doi } from './Doi';

export type Tab = (typeof TABS)[keyof typeof TABS];

export type TabProps = {
	doi: Doi;
	isInfoOpen: boolean;
	toggleInfo: () => void;
};
