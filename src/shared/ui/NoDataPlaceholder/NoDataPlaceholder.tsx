import { CircleAlert } from 'lucide-react';
import { DataPlaceholder } from '../core/DataPlaceholder/DataPlaceholder';

export const NoDataPlaceholder = () => {
	return <DataPlaceholder icon={<CircleAlert />} title="Data not available" />;
};
