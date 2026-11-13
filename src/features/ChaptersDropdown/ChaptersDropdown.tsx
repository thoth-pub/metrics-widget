import { useSelectedChapters, type WorkEntity } from '@/shared';
import { Search } from 'lucide-react';
import { FilterDropdown } from '../FilterDropdown/FilterDropdown';

export const ChaptersDropdown = ({ chapters }: { chapters: WorkEntity[] }) => {
	const { selectedChapters, setSelectedChapters } = useSelectedChapters();

	// Only children with a DOI can be selected: a metrics read selects children by DOI.
	const chapterItems = chapters
		.filter((chapter) => chapter.doi.length > 0)
		.map((chapter) => ({
			label: chapter.title,
			value: chapter.doi,
		}));

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
