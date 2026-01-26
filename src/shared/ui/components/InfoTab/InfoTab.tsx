import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../../core/Accordion/Accordion';

const InfoTab = () => {
	return (
		<div className="flex flex-col gap-4">
			<h2 className="font-semibold text-sm">Measures</h2>
			<Accordion type="single" collapsible defaultValue="item-1">
				<AccordionItem value="item-1">
					<AccordionTrigger>Google Book Views</AccordionTrigger>
					<AccordionContent>
						Book Visits represent the total number of times a book has been
						accessed. This can include multiple visits by the same IP address,
						which are counted as separate visits. Google books only reports back
						to the publisher, the book visits and book page views
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>OBP PDF Reader Sessions</AccordionTrigger>
					<AccordionContent>
						OBP PDF Reader Sessions represent the total number of times a PDF
						has been accessed. This can include multiple visits by the same IP
						address, which are counted as separate visits. OBP PDF Reader
						Sessions only reports back to the publisher, the PDF reader sessions
						and PDF reader page views
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>OBP Downloads</AccordionTrigger>
					<AccordionContent>
						OBP PDF Reader Sessions represent the total number of times a PDF
						has been accessed. This can include multiple visits by the same IP
						address, which are counted as separate visits. OBP PDF Reader
						Sessions only reports back to the publisher, the PDF reader sessions
						and PDF reader page views
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-4">
					<AccordionTrigger>OAPEN Downloads</AccordionTrigger>
					<AccordionContent>
						OBP PDF Reader Sessions represent the total number of times a PDF
						has been accessed. This can include multiple visits by the same IP
						address, which are counted as separate visits. OBP PDF Reader
						Sessions only reports back to the publisher, the PDF reader sessions
						and PDF reader page views
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
};

export default InfoTab;
