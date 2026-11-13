import {
	DataPlaceholder,
	MetricCaptions,
	type SharesProblem,
} from '@/shared';
import { CircleAlert } from 'lucide-react';

type GeographyContentProps = {
	captions: string[];
	notes: string[];
	problem: SharesProblem | null;
	emptyText: string | null;
	children: React.ReactNode;
};

/**
 * The content of a geography tab: the captions, then the chart, or instead of it the reason no shares can be
 * drawn or the absence of country values (never shown as 0%), then the no-breakdown note.
 */
export const GeographyContent = ({
	captions,
	notes,
	problem,
	emptyText,
	children,
}: GeographyContentProps) => {
	let content = children;

	if (emptyText) {
		content = <DataPlaceholder icon={<CircleAlert />} title={emptyText} />;
	} else if (problem) {
		content = (
			<div className="flex flex-col items-center justify-center h-full gap-2 text-center">
				<DataPlaceholder icon={<CircleAlert />} title={problem.title} />
				<p className="text-xs">{problem.description}</p>
			</div>
		);
	}

	return (
		<>
			<MetricCaptions captions={captions} />
			{content}
			<MetricCaptions captions={notes} />
		</>
	);
};
