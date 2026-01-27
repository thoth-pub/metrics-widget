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
		<TabsContent {...props} className="flex flex-col h-full">
			<div className="h-12.5 px-4 py-2 bg-header-background flex items-center justify-between">
				{filter}
				<h2 className="economica">{isInfoOpen ? 'Information' : title}</h2>
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
			<div className="p-4 flex-1">
				{isInfoOpen && <InfoTab />}
				{!isInfoOpen && !isLoading && children}
				{!isInfoOpen && isLoading && (
					<Spinner className="m-auto size-12 h-full text-spinner" />
				)}
			</div>
		</TabsContent>
	);
};
