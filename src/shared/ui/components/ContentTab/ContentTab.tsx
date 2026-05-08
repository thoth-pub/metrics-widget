import type { TabsContentProps } from '@radix-ui/react-tabs';
import { Info } from 'lucide-react';
import { Button } from '../../core/Button/Button';
import { Spinner } from '../../core/Spinner/Spinner';
import { TabsContent } from '../../core/Tabs/Tabs';
import { InfoTab } from '../InfoTab/InfoTab';

type ContentTabProps = {
	title: string;
	includedSources: string[];
	isInfoOpen?: boolean;
	isLoading?: boolean;
	filter?: React.ReactNode;
	action?: React.ReactNode;
	onToggleInfo?: () => void;
} & TabsContentProps;

export const ContentTab = ({
	title,
	includedSources,
	isInfoOpen = false,
	isLoading = false,
	filter,
	action,
	children,
	onToggleInfo,
	...props
}: ContentTabProps) => {
	return (
		<TabsContent {...props} className="flex flex-col h-(--mw-content-height)">
			<div className="relative h-(--mw-header-height) px-4 py-2 bg-header-background flex items-center justify-between">
				<div className="relative z-10">{filter}</div>
				<p className="economica hidden sm:block absolute left-0 w-full text-center pointer-events-none">
					{isInfoOpen ? 'Information' : title}
				</p>
				<div className="ml-2.5 flex gap-2.5 relative z-10">
					{action}
					<Button
						variant={isInfoOpen ? 'active' : 'outline'}
						aria-label="Toggle information panel"
						size="icon"
						onClick={onToggleInfo}
					>
						<Info />
					</Button>
				</div>
			</div>
			<div className="px-4 pt-4 flex-1 flex overflow-auto mb-4">
				<div className="flex flex-col gap-4 grow">
					{!isLoading && (
						<p className="economica block sm:hidden text-center">
							{isInfoOpen ? 'Information' : title}
						</p>
					)}
					{isInfoOpen && <InfoTab includedSources={includedSources} />}
					{!isInfoOpen && !isLoading && children}
					{!isInfoOpen && isLoading && (
						<Spinner className="m-auto size-12 h-full text-spinner" />
					)}
				</div>
			</div>
		</TabsContent>
	);
};
