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

const textStyles = 'max-w-30 truncate';

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

	const disabledItems = items.filter((item) => item.disabled);
	const availableItems = items.filter((item) => !item.disabled);

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
				className="max-w-full sm:max-w-46"
				showClear
			>
				{icon && <InputGroupAddon>{icon}</InputGroupAddon>}
			</ComboboxInput>
			<ComboboxContent className="w-46" alignOffset={icon ? -28 : 0}>
				<ComboboxList>
					{availableItems.map((item) => (
						<ComboboxItem
							key={item.value}
							value={item}
							disabled={item.disabled}
						>
							<span className={textStyles}>{item.label}</span>
						</ComboboxItem>
					))}
					{disabledItems.length > 0 && (
						<Tooltip>
							<TooltipTrigger>
								{disabledItems.map((item) => (
									<ComboboxItem key={item.value} value={item} disabled>
										<span className={textStyles}>{item.label}</span>
									</ComboboxItem>
								))}
							</TooltipTrigger>
							<TooltipContent side="right">
								{disabledItems[0].disabledReason}
							</TooltipContent>
						</Tooltip>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
};
