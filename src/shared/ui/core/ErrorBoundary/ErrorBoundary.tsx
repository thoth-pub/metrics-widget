import { Button, Wrapper } from '@/shared';
import { RotateCcw } from 'lucide-react';

type ErrorBoundaryProps = {
	onRetry?: () => void;
};

export const ErrorBoundary = ({ onRetry }: ErrorBoundaryProps) => {
	return (
		<Wrapper>
			<div className="flex flex-col items-center justify-center h-full gap-2">
				<span>Something went wrong</span>
				<Button onClick={onRetry} size="icon" className="bg-transparent">
					<RotateCcw />
				</Button>
			</div>
		</Wrapper>
	);
};
