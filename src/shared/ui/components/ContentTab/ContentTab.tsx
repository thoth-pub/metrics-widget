import type { TabsContentProps } from '@radix-ui/react-tabs';
import { Info } from 'lucide-react';
import { Button } from '../../core/Button/Button';
import { TabsContent } from '../../core/Tabs/Tabs';
import InfoTab from '../InfoTab/InfoTab';

type ContentTabProps = {
	title: string;
	isInfoOpen?: boolean;
	onExportCsv?: () => void;
	onToggleInfo: () => void;
} & TabsContentProps;

const ContentTab = ({
	title,
	isInfoOpen,
	children,
	onExportCsv,
	onToggleInfo,
	...props
}: ContentTabProps) => {
	return (
		<TabsContent {...props}>
			<div className="h-12.5 px-4 py-2 bg-header-background flex items-center justify-between">
				<div>Dropdown</div>
				<h2 className="economica">{isInfoOpen ? 'Information' : title}</h2>
				<div className="flex gap-2.5">
					<Button variant="outline" onClick={onExportCsv}>
						CSV
					</Button>
					<Button
						variant={isInfoOpen ? 'active' : 'outline'}
						size="icon"
						onClick={onToggleInfo}
					>
						<Info />
					</Button>
				</div>
			</div>
			<div className="p-4 bg-background-alt h-full">
				{isInfoOpen ? <InfoTab /> : children}
			</div>
		</TabsContent>
	);
};

export default ContentTab;
