import { Button } from '@/shared';

type CsvExportButtonProps = {
	data: string[][];
	filename?: string;
};

export const CSVDownloadButton = ({ data, filename= 'download.csv' }: CsvExportButtonProps) => {
	const downloadCSV = () => {
		const csvString = data.map((row) => row.join(',')).join('\n');

		const blob = new Blob([csvString], { type: 'text/csv' });

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<Button
			variant="outline"
			aria-label="Export CSV"
			onClick={downloadCSV}
			disabled={data.length === 0}
		>
			CSV
		</Button>
	);
};
