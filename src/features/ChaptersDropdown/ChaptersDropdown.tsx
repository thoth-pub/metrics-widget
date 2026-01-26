import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	InputGroupAddon,
	useSelectedChapters,
	type WorkEntity,
} from '@/shared';
import { Search } from 'lucide-react';

export const ChaptersDropdown = ({ chapters }: { chapters: WorkEntity[] }) => {
	const { selectedChapters, setSelectedChapters } = useSelectedChapters();

	const chapterItems = chapters.map((chapter) => {
		return {
			label: chapter.title,
			value: chapter.doi,
		};
	});

	// const selectedTitles = selectedChapters.map((item) => item.label).join(', ');
	const chaptersSelected =
		selectedChapters.length > 1
			? `Selected ${selectedChapters.length} chapters`
			: 'Selected 1 chapter';
	const placeholder =
		selectedChapters.length > 0 ? chaptersSelected : 'All chapters';

	return (
		<Combobox
			items={chapterItems}
			multiple
			value={selectedChapters}
			itemToStringValue={(chapter) => chapter.label}
			isItemEqualToValue={(item, value) => item.value === value.value}
			onValueChange={setSelectedChapters}
			disabled={chapters.length === 0}
		>
			<ComboboxInput placeholder={placeholder} className="max-w-46" showClear>
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
				{/* {selectedChapters.length > 0 && (
					<div className="focus:none absolute top-2 w-4 h-4 bg-red-500 right-6 font-inherit text-sm">
						+{selectedChapters.length}
					</div>
				)} */}
			</ComboboxInput>
			<ComboboxContent className="w-46" alignOffset={-28}>
				<ComboboxList>
					{(chapter) => (
						<ComboboxItem key={chapter.value} value={chapter}>
							{chapter.label}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
};
