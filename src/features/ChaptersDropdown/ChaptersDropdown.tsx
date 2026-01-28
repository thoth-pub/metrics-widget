import { useSelectedChapters, type WorkEntity } from '@/shared';
import { Search } from 'lucide-react';
import { FilterDropdown } from '../FilterDropdown/FilterDropdown';

export const ChaptersDropdown = ({ chapters }: { chapters: WorkEntity[] }) => {
	const { selectedChapters, setSelectedChapters } = useSelectedChapters();

	const chapterItems = chapters.map((chapter) => {
		return {
			label: chapter.title,
			value: chapter.doi,
		};
	});

	return (
		<FilterDropdown
			items={chapterItems}
			placeholder="chapter"
			value={selectedChapters}
			onValueChange={setSelectedChapters}
			icon={<Search />}
		/>
	);
};
