export const Wrapper = ({
	children,
}: {
	children: Readonly<React.ReactNode>;
}) => {
	return (
		<div className="max-w-[630px] flex flex-col w-full h-[490px] mx-auto bg-background">
			{children}
		</div>
	);
};
