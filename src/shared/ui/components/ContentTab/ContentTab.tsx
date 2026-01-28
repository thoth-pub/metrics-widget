import type { TabsContentProps } from '@radix-ui/react-tabs';
import { Info } from 'lucide-react';
import { Button } from '../../core/Button/Button';
import { Spinner } from '../../core/Spinner/Spinner';
import { TabsContent } from '../../core/Tabs/Tabs';
import { InfoTab } from '../InfoTab/InfoTab';

type ContentTabProps = {
	title: string;
	isInfoOpen?: boolean;
	isLoading?: boolean;
	filter?: React.ReactNode;
	action?: React.ReactNode;
	onToggleInfo?: () => void;
} & TabsContentProps;

export const ContentTab = ({
	title,
	isInfoOpen = false,
	isLoading = false,
	filter,
	action,
	children,
	onToggleInfo,
	...props
}: ContentTabProps) => {
	return (
		<TabsContent {...props} className="flex flex-col h-(--content-height)">
			<div className="h-(--header-height) px-4 py-2 bg-header-background flex items-center justify-between">
				{filter}
				<h2 className="economica hidden sm:block">
					{isInfoOpen ? 'Information' : title}
				</h2>
				<div className="flex gap-2.5">
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
						<h2 className="economica block sm:hidden text-center">
							{isInfoOpen ? 'Information' : title}
						</h2>
					)}
					{isInfoOpen && <InfoTab />}
					{!isInfoOpen && !isLoading && children}
					{!isInfoOpen && isLoading && (
						<Spinner className="m-auto size-12 h-full text-spinner" />
					)}
				</div>
			</div>
		</TabsContent>
	);
};
