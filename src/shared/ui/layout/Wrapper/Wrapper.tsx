import { useThemeApplied } from '@/shared/hooks';

export const Wrapper = ({
	children,
}: {
	children: Readonly<React.ReactNode>;
}) => {
	const themeApplied = useThemeApplied();

	return (
		<div
			style={{ visibility: themeApplied ? undefined : 'hidden' }}
			className="max-w-(--mw-max-width) flex flex-col w-full h-(--mw-max-height) overflow-clip mx-auto bg-background-alt text-sm"
		>
			{children}
		</div>
	);
};
