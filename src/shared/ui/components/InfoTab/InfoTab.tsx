import type { InfoEntry } from '../../../metricWidget/info';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../../core/Accordion/Accordion';

type InfoTabProps = {
	entries: InfoEntry[];
};

/**
 * Each served pair of the read the tab shows, with its measure definition and then its platform's public
 * description when it has one. Every text comes from the response and is rendered as text, never as HTML.
 */
export const InfoTab = ({ entries }: InfoTabProps) => {
	return (
		<>
			<p className="font-semibold text-sm">Measures</p>
			<Accordion type="single" collapsible>
				{entries.map((entry) => (
					<AccordionItem key={entry.key} value={entry.key}>
						<AccordionTrigger>{entry.title}</AccordionTrigger>
						<AccordionContent>
							<p>{entry.definition}</p>
							{entry.description !== null && (
								<p className="mt-2">{entry.description}</p>
							)}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</>
	);
};
