import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	type FilterOption,
	InputGroupAddon,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/shared';

type FilterDropdownProps = {
	items: FilterOption[];
	placeholder: string;
	icon?: React.ReactNode;
	value: FilterOption[];
	onValueChange: (value: FilterOption[]) => void;
};

export const FilterDropdown = ({
	items,
	placeholder,
	value,
	icon,
	onValueChange,
}: FilterDropdownProps) => {
	const itemsSelected =
		value.length > 1 ? ` ${value.length} ${placeholder}s` : `1 ${placeholder}`;
	const placeholderText = value.length > 0 ? itemsSelected : 'All items';

	return (
		<Combobox
			items={items}
			multiple
			value={value}
			itemToStringValue={(item) => item.label}
			isItemEqualToValue={(item, value) => item.value === value.value}
			onValueChange={onValueChange}
			disabled={items.length === 0}
		>
			<ComboboxInput
				placeholder={placeholderText}
				className="max-w-46"
				showClear
			>
				{icon && <InputGroupAddon>{icon}</InputGroupAddon>}
			</ComboboxInput>
			<ComboboxContent className="w-46" alignOffset={icon ? -28 : 0}>
				<ComboboxList>
					{(item) => (
						<>
							{item.disabled ? (
								<Tooltip>
									<TooltipTrigger>
										<ComboboxItem
											key={item.value}
											value={item}
											disabled={item.disabled}
										>
											<span className="max-w-30 truncate">{item.label}</span>
										</ComboboxItem>
									</TooltipTrigger>
									<TooltipContent side="right">
										{item.disabledReason}
									</TooltipContent>
								</Tooltip>
							) : (
								<ComboboxItem
									key={item.value}
									value={item}
									disabled={item.disabled}
								>
									<span className="max-w-30 truncate">{item.label}</span>
								</ComboboxItem>
							)}
						</>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
};
