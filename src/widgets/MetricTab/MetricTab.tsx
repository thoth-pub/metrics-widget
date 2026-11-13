import { ChaptersDropdown, CSVDownloadButton } from '@/features';
import {
	ContentTab,
	infoEntries,
	type InfoEntry,
	MetricErrorState,
	type MetricWidgetYear,
	MetricWidgetUnavailableError,
	NoDataPlaceholder,
	type Tab,
} from '@/shared';

type MetricTabProps = {
	value: Tab;
	title: string;
	year: MetricWidgetYear;
	isInfoOpen: boolean;
	toggleInfo: () => void;
	/** The info panel entries of the read the tab shows; R-YEAR's pairs by default. */
	info?: InfoEntry[];
	/** Shown as a CSV button only when the tab shows data. */
	csvData?: string[][];
	/** The tab's content, rendered only when R-YEAR serves at least one pair. */
	children: React.ReactNode;
};

/**
 * A tab on top of the year read (R-YEAR). The header (title, info toggle, and the chapter dropdown for a book
 * embed) always stays, so a reader can change or clear a chapter selection whatever the state. Until the metadata
 * read and R-YEAR settle the content area shows a spinner; a failed R-YEAR replaces it with its error state (and
 * hides the CSV button); a read that serves no pair shows "Data not available".
 */
export const MetricTab = ({
	value,
	title,
	year,
	isInfoOpen,
	toggleInfo,
	info,
	csvData,
	children,
}: MetricTabProps) => {
	const { error, view, isLoading } = year;
	const hasData = !isLoading && !error && view !== null && !view.isEmpty;

	const filter =
		year.isMetaDataSettled && !year.isChapterEmbed ? (
			<ChaptersDropdown chapters={year.metaData.chapters} />
		) : undefined;

	const action =
		hasData && csvData ? <CSVDownloadButton data={csvData} /> : undefined;

	let content: React.ReactNode = children;

	if (error) {
		content = (
			<MetricErrorState
				isUnavailable={error instanceof MetricWidgetUnavailableError}
				onRetry={year.retry}
			/>
		);
	} else if (!hasData) {
		content = <NoDataPlaceholder />;
	}

	return (
		<ContentTab
			value={value}
			title={title}
			info={info ?? infoEntries(hasData ? view : null)}
			filter={filter}
			action={action}
			isInfoOpen={isInfoOpen}
			isLoading={isLoading}
			onToggleInfo={toggleInfo}
		>
			{content}
		</ContentTab>
	);
};
