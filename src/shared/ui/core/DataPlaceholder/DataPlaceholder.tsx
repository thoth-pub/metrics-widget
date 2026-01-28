type DataPlaceholderProps = {
	icon: React.ReactNode;
	title: string;
};

export const DataPlaceholder = ({ icon, title }: DataPlaceholderProps) => {
	return (
		<div className="flex flex-col gap-4 items-center justify-center h-full">
			<div className="p-4 bg-placeholder-icon-bg rounded-full text-placeholder-icon">
				{icon}
			</div>
			<span className="text-lg">{title}</span>
		</div>
	);
};
