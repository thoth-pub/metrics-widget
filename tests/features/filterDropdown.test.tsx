import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChaptersDropdown } from '@/features/ChaptersDropdown/ChaptersDropdown';
import { FilterDropdown } from '@/features/FilterDropdown/FilterDropdown';
import type { FilterOption, WorkEntity } from '@/shared';
import { useSelectedChapters } from '@/shared/hooks';
import { createSelectableWrapper, createWrapper } from '../helpers/wrapper';

const input = (placeholder: string) =>
	screen.getByPlaceholderText(placeholder) as HTMLInputElement;

/** Base UI marks the visible combobox input with `data-disabled`. */
const isDisabled = (element: HTMLInputElement) =>
	element.disabled || element.hasAttribute('data-disabled');

/** Opens the list and picks the option with this label, as a reader would. */
const pick = async (placeholder: string, label: string) => {
	fireEvent.click(input(placeholder));
	fireEvent.keyDown(input(placeholder), { key: 'ArrowDown' });
	fireEvent.click(await screen.findByRole('option', { name: label }));
};

const Controlled = ({
	items,
	placeholder,
	onChange,
}: {
	items: FilterOption[];
	placeholder: string;
	onChange: (value: FilterOption[]) => void;
}) => {
	const [value, setValue] = useState<FilterOption[]>([]);

	return (
		<FilterDropdown
			items={items}
			placeholder={placeholder}
			value={value}
			onValueChange={(next) => {
				setValue(next);
				onChange(next);
			}}
		/>
	);
};

describe('FilterDropdown with one or no item', () => {
	it.each([
		['year', { label: '2026 (Feb–Nov)', value: '2026-02-01' }],
		['measure', { label: 'OAPEN · Downloads', value: 'p/m' }],
	])('shows a single %s and lets it be selected', async (placeholder, item) => {
		const onChange = vi.fn();

		render(
			<Controlled
				items={[item]}
				placeholder={placeholder}
				onChange={onChange}
			/>,
			{ wrapper: createWrapper() },
		);

		expect(isDisabled(input('All items'))).toBe(false);
		expect(
			screen.queryByPlaceholderText(`No ${placeholder}s available`),
		).toBeNull();

		await pick('All items', item.label);

		await waitFor(() => expect(onChange).toHaveBeenLastCalledWith([item]));
		expect(isDisabled(input(`1 ${placeholder}`))).toBe(false);
	});

	it('says "No … available" and is disabled only with zero items', () => {
		render(
			<FilterDropdown
				items={[]}
				placeholder="year"
				value={[]}
				onValueChange={() => {}}
			/>,
			{ wrapper: createWrapper() },
		);

		expect(isDisabled(input('No years available'))).toBe(true);
	});
});

describe('ChaptersDropdown', () => {
	const chapter = (doi: string, title: string): WorkEntity => ({
		doi,
		title,
		type: 'BOOK_CHAPTER',
		ordinal: 1,
	});

	const Selection = () => {
		const { selectedChapters } = useSelectedChapters();

		return (
			<output data-testid="selection">
				{selectedChapters.map(({ value }) => value).join(',')}
			</output>
		);
	};

	it('lets a reader select the only chapter with a DOI of a book', async () => {
		const { Wrapper } = createSelectableWrapper(null, []);

		render(
			<>
				<ChaptersDropdown
					chapters={[
						chapter('10.11647/test.0001.01', 'Chapter One'),
						chapter('', 'Chapter Without DOI'),
					]}
				/>
				<Selection />
			</>,
			{ wrapper: Wrapper },
		);

		expect(isDisabled(input('All items'))).toBe(false);

		await pick('All items', 'Chapter One');

		await waitFor(() =>
			expect(screen.getByTestId('selection').textContent).toBe(
				'10.11647/test.0001.01',
			),
		);
		expect(
			screen.queryByRole('option', { name: 'Chapter Without DOI' }),
		).toBeNull();
	});

	it('is disabled with "No chapters available" when no chapter has a DOI', () => {
		render(
			<ChaptersDropdown chapters={[chapter('', 'Chapter Without DOI')]} />,
			{
				wrapper: createSelectableWrapper(null, []).Wrapper,
			},
		);

		expect(isDisabled(input('No chapters available'))).toBe(true);
	});
});
