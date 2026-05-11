import { useState } from 'react';
import { PortalContainerContext } from '@/shared/context';
import { useThemeApplied } from '@/shared/hooks';

export const Wrapper = ({
	children,
}: {
	children: Readonly<React.ReactNode>;
}) => {
	const themeApplied = useThemeApplied();
	const [portalContainer, setPortalContainer] =
		useState<HTMLDivElement | null>(null);

	return (
		<div ref={setPortalContainer} className="mw-root">
			<PortalContainerContext.Provider value={portalContainer}>
				<div
					style={{ visibility: themeApplied ? undefined : 'hidden' }}
					className="@container max-w-(--mw-max-width) flex flex-col w-full h-(--mw-max-height) overflow-clip mx-auto bg-background-alt text-typography font-open-sans text-sm"
				>
					{children}
				</div>
			</PortalContainerContext.Provider>
		</div>
	);
};
