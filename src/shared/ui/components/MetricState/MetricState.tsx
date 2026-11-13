import { CircleAlert, RotateCcw } from 'lucide-react';
import { Button } from '../../core/Button/Button';
import { DataPlaceholder } from '../../core/DataPlaceholder/DataPlaceholder';

export const METRICS_UNAVAILABLE_TEXT = 'Metrics are not available for this work';
export const METRICS_FAILED_TEXT = 'Something went wrong';

type MetricErrorStateProps = {
	/** "Metrics are not available for this work", with no retry button. */
	isUnavailable: boolean;
	onRetry: () => void;
};

/** A failed metrics read, shown inside a tab's content area (or the month chart) with its own retry button. */
export const MetricErrorState = ({
	isUnavailable,
	onRetry,
}: MetricErrorStateProps) => {
	if (isUnavailable) {
		return (
			<DataPlaceholder icon={<CircleAlert />} title={METRICS_UNAVAILABLE_TEXT} />
		);
	}

	return (
		<div className="flex flex-col items-center justify-center h-full gap-2">
			<span>{METRICS_FAILED_TEXT}</span>
			<Button
				onClick={onRetry}
				size="icon"
				className="bg-transparent"
				aria-label="Retry"
			>
				<RotateCcw />
			</Button>
		</div>
	);
};

type MetricCaptionsProps = {
	captions: string[];
};

/** The captions and notes under a chart, as plain text. */
export const MetricCaptions = ({ captions }: MetricCaptionsProps) => {
	if (captions.length === 0) return null;

	return (
		<div className="flex flex-col gap-0.5 text-xs text-center">
			{captions.map((caption) => (
				<p key={caption}>{caption}</p>
			))}
		</div>
	);
};
