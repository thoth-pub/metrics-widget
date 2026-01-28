export const Wrapper = ({
	children,
}: {
	children: Readonly<React.ReactNode>;
}) => {
	return (
		<div className="max-w-(--max-width) flex flex-col w-full h-(--max-height) overflow-clip mx-auto bg-background-alt">
			{children}
		</div>
	);
};
