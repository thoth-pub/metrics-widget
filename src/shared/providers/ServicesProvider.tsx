import { defaultServices, ServicesContext } from '../context';

type ServicesProviderProps = {
	children: Readonly<React.ReactNode>;
};

export const ServicesProvider = ({ children }: ServicesProviderProps) => {
	return <ServicesContext value={defaultServices}>{children}</ServicesContext>;
};
