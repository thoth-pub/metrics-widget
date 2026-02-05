import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../../core/Accordion/Accordion';

type InfoTabProps = {
	includedSources: string[];
};

const infoData = [
	{
		title: 'Google Books Views',
		description:
			'Book Visits represent the total number of times a book has been accessed. This can include multiple visits by the same IP address, which are counted as separate visits. Google Books only reports back to the publisher the Book Visits and Book Page Views.',
	},
	{
		title: 'Twitter',
		description:
			'The number of tweets that included either the DOI or a URL of the publication.',
	},
	{
		title: 'Historical',
		description:
			'Downloads from before the content migrated to the current platform (that provides data to OPERAS Metrics).',
	},
	{
		title: 'Crossref',
		description:
			'Provides DOI-based CrossRef Citation Data as a source for metrics.',
	},
	{
		title: 'UPLO downloads',
		description:
			'Total number of times a work has been downloaded, as determined by processing the access logs specific to the UPLO website. To count multiple downloads of the same file by the same user, there must be a gap of 30 minutes from the last counted download.',
	},
	{
		title: 'UPLO reads',
		description:
			'Total views on pages where the work can be read, as determined by processing the access logs specific to the UPLO website. To count multiple reads on the same page by the same user, there must be a gap of 30 minutes from the last counted read.',
	},
	{
		title: 'UPLO Sessions',
		description:
			'Total views of the landing page of a work, as determined by processing the access logs specific to the UPLO website. To count multiple views of the same landing page by the same user, there must be a gap of 30 minutes from the last counted view.',
	},
	{
		title: 'Figshare Shares',
		description:
			'This metric refers to the act of sharing the item on social media platforms or other digital channels.',
	},
	{
		title: 'Figshare Downloads',
		description:
			'This metric shows the number of times one or all files in your Figshare item have been downloaded. For example, if you item has multiple files, if someone downloads one of the files, that will be counted as one download. If someone clicks the "Download all" button, that will be counted as one download. If there are three files in an item and someone downloads each file individually, the download count will be incremented by three.',
	},
	{
		title: 'Figshare Views',
		description:
			'This metric shows the number of times your Figshare item page has been viewed.',
	},
	{
		title: 'Ubiquity Press Reads',
		description:
			"Total views on pages where the work can be read, as determined by Google Analytics. To count multiple reads on the same page by the same user, there must be a period of at least 30 minutes of inactivity on the website, by the user. Note: The user's activity is logged in a session. The example below considers one type of interaction on a single page; however, a single session can contain interactions involving page views, downloads, and reads (even across different pages on the website). These interactions are logged within the same session if they occur before the session timeout. The user's session must end before another read of a specific page can be counted for that user (i.e. as part of an different session).",
	},
	{
		title: 'Ubiquity Press Downloads',
		description:
			"Total downloads, as determined by Google Analytics. To count multiple downloads of the same file by the same user, there must be a period of at least 30 minutes of inactivity on the website, by the user. Note: The user's activity is logged in a session. The example below considers one type of interaction on a single page; however, a single session can contain interactions involving page views, downloads, and reads (even across different pages on the website). These interactions are logged within the same session if they occur before the session timeout. The user's session must end before another download of a specific file can be counted for that user (i.e. as part of an different session).",
	},
	{
		title: 'Ubiquity Press Sessions',
		description:
			"Total views of the landing page of a work, as determined by Google Analytics. To count multiple views of the same page by the same user, there must be a period of at least 30 minutes of inactivity on the website, by the user. Note: The user's activity is logged in a session. The example below considers one type of interaction on a single page; however, a single session can contain interactions involving page views, downloads, and reads (even across different pages on the website). These interactions are logged within the same session if they occur before the session timeout. The user's session must end before another view of a specific page can be counted for that user (i.e. as part of an different session).",
	},
	{
		title: 'Wordpress References',
		description:
			'The number of posts in Wordpress.com hosted blogs that have referenced either the DOI or the URL of the publication.',
	},
	{
		title: 'Wikipedia References',
		description:
			'The number of articles in wikipedia that have referenced either the DOI or the URL of the publication.',
	},
	{
		title: 'Hypothes.is Annotations',
		description:
			'The number of public annotations left in the html or pdf online version of the publication using the Hypothes.is web annotation tool.',
	},
	{
		title: 'Εθνικό Κέντρο Τεκμηρίωσης',
		description:
			'This measure represents the number of sessions recorded at the publication landing page (the publication description page). A Landing Page Session is a group of visits made by the same user within a continuous time frame. To record these sessions at EKT we use Google Analytics, and a session lasts until there are 30 minutes of inactivity; if a single user keeps interacting with the website within this time frame, multiple visits to the same book landing page will be counted as one session.',
	},
	{
		title: 'The Classics Library Sessions',
		description:
			'A Book Session is a group of visits made by the same user within a continuous time frame. To record these sessions at the Classics Library we use Google Analytics, and a session lasts until there are 30 minutes of inactivity; if a single user keeps interacting with the website within this time frame, multiple visits to the same book will be counted as one session.',
	},
	{
		title: 'JSTOR Downloads',
		description:
			'This measure represents the total number of times a chapter has been downloaded. This can include multiple downloads by the same IP address, which are counted as separate downloads.',
	},
	{
		title: 'JSTOR Views',
		description:
			'This measure represents the total number of times that the online PDF version of a chapter has been viewed. This can include multiple views by the same IP address, which are counted as separate views.',
	},
	{
		title: 'OAPEN Downloads',
		description:
			'Download metrics at the OAPEN library are collected and reported by IRUS-UK using COUNTER-conformant practises.',
	},
	{
		title: 'Open Edition Downloads',
		description:
			'This measure represents the total number of times a work has been downloaded. This can include multiple downloads by the same IP address, which are counted as separate downloads. Open Edition reports are generated using AWStats.',
	},
	{
		title: 'Open Edition Views',
		description:
			'Open Edition provides an HTML version of a book, where each chapter is provided in a separate page. This measure represents the total number of times a chapter has been accessed. This can include multiple visits by the same IP address, which are counted as separate visits. Open Edition reports are generated using AWStats.',
	},
	{
		title: 'World Reader',
		description:
			'World Reader is provided to users in the form of an app, making it easier to determine unique users accessing a particular publication (as opposed to sessions, or views). This measure represents the total number of unique users that accessed a book in the reported period, multiple visits to the same book from the same user will be counted as a single user.',
	},
	{
		title: 'Open Book Publishers Downloads',
		description:
			'Book Downloads represent the total number of times a book has been downloaded. In order to calculate these, at Open Book Publishers we process our web logs to calculate download sessions, and a session lasts until there are 30 minutes of inactivity; if a single user keeps interacting with the website within this time frame, multiple downloads of the same book will be counted as one.',
	},
	{
		title: 'Open Book Publishers PDF Reader Sessions',
		description:
			'A Book Session is a group of visits made by the same user within a continuous time frame. To record these sessions at Open Book Publishers we use Google Analytics, and a session lasts until there are 30 minutes of inactivity; if a single user keeps interacting with the website within this time frame, multiple visits to the same book will be counted as one session.',
	},
	{
		title: 'Open Book Publishers HTML Reader Sessions',
		description:
			'A Book Session is a group of visits made by the same user within a continuous time frame. To record these sessions at Open Book Publishers we use Google Analytics, and a session lasts until there are 30 minutes of inactivity; if a single user keeps interacting with the website within this time frame, multiple visits to the same book will be counted as one session.',
	},
];

export const InfoTab = ({ includedSources }: InfoTabProps) => {
	const lowercasedSources = includedSources.map((source) =>
		source.toLowerCase(),
	);
	const filteredInfoData = infoData.filter((item) =>
		lowercasedSources.some((source) =>
			item.title.toLowerCase().includes(source),
		),
	);

	return (
		<>
			<h2 className="font-semibold text-sm">Measures</h2>
			<Accordion type="single" collapsible>
				{filteredInfoData.map((item, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: index is unique
					<AccordionItem key={index} value={`item-${index}`}>
						<AccordionTrigger>{item.title}</AccordionTrigger>
						<AccordionContent>{item.description}</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</>
	);
};
