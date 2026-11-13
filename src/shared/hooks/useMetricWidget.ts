import {
	type UseQueryOptions,
	useQueries,
	useQuery,
} from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { config } from '../config';
import { QUERY_KEYS } from '../constants';
import type {
	Doi,
	MetricWidgetData,
	MetricWidgetGrain,
	MetricWidgetInput,
} from '../interfaces';
import {
	buildMetricWidgetView,
	type DateRange,
	type MetricWidgetView,
	metricWidgetEndDate,
} from '../metricWidget';
import {
	type MetricWidgetError,
	MetricWidgetFailedError,
	metricWidgetRetryDelay,
	shouldRetryMetricWidgetRead,
} from '../services/metricWidgetService';
import { assignPlatformColors, getColor, type PlatformColor } from '../utils';
import { useDOIs } from './useDOIs';
import { useMetaData } from './useMetaData';
import { useServices } from './useServices';
import { useTheme } from './useTheme';

/**
 * `['METRIC_WIDGET', grain, doi, chapterDois or 'ALL', startDate or null, endDate]`. The DOI is part of the key, so
 * two works never share a cached result.
 */
export const metricWidgetQueryKey = ({
	timelineGrain,
	doi,
	chapterDois,
	startDate,
	endDate,
}: MetricWidgetInput) =>
	[
		QUERY_KEYS.METRIC_WIDGET,
		timelineGrain,
		doi,
		chapterDois ?? 'ALL',
		startDate ?? null,
		endDate,
	] as const;

/**
 * Query options of every metrics read: a failed read is sent again only by a retry button, by the one automatic
 * retry its class allows, or (for the year read) by a new chapter selection; never by a remount, a focus or
 * network change, or the passage of time.
 */
export const metricWidgetQueryOptions = {
	staleTime: config.query.staleTime,
	gcTime: Number.POSITIVE_INFINITY,
	retryOnMount: false,
	refetchOnMount: false,
	refetchOnWindowFocus: false,
	refetchOnReconnect: false,
	retry: shouldRetryMetricWidgetRead,
	retryDelay: metricWidgetRetryDelay,
} as const;

/** The variables of one read, without absent optional fields. */
export const metricWidgetInput = (
	timelineGrain: MetricWidgetGrain,
	doi: string,
	chapterDois: string[] | undefined,
	range: { startDate?: string; endDate: string },
): MetricWidgetInput => ({
	doi,
	...(chapterDois ? { chapterDois } : {}),
	...(range.startDate ? { startDate: range.startDate } : {}),
	endDate: range.endDate,
	timelineGrain,
});

export type MetricReadState = {
	/** True until the read (and, for the year read, the metadata read) has settled, or while a retry runs. */
	isLoading: boolean;
	error: MetricWidgetError | null;
	/** The view of a successful read; `null` while loading or after a failure. */
	view: MetricWidgetView | null;
	/** Sends the read once more (a retry button). */
	retry: () => void;
};

type QueryState = {
	data: MetricWidgetData | undefined;
	error: Error | null;
	isPending: boolean;
	isError: boolean;
	isFetching: boolean;
	refetch: () => Promise<unknown>;
};

const useReadState = (
	query: QueryState | undefined,
	grain: MetricWidgetGrain,
	isChapterEmbed: boolean,
	isSettled: boolean,
): MetricReadState => {
	const data = query?.data;
	const view = useMemo(
		() =>
			data && isSettled
				? buildMetricWidgetView(data, { grain, isChapterEmbed })
				: undefined,
		[data, grain, isChapterEmbed, isSettled],
	);

	if (!query) {
		return { isLoading: true, error: null, view: null, retry: () => {} };
	}

	const retry = () => {
		void query.refetch();
	};

	if (!isSettled || query.isPending || (query.isError && query.isFetching)) {
		return { isLoading: true, error: null, view: null, retry };
	}

	if (query.error) {
		return {
			isLoading: false,
			error: query.error as MetricWidgetError,
			view: null,
			retry,
		};
	}

	if (!view) {
		return {
			isLoading: false,
			error: new MetricWidgetFailedError('INVALID_RESPONSE'),
			view: null,
			retry,
		};
	}

	return { isLoading: false, error: null, view, retry };
};

const resolveColor = (
	colors: Map<string, PlatformColor>,
	fallback: string,
	platformId: string,
) => colors.get(platformId)?.color ?? fallback;

/**
 * The year read (R-YEAR): all served history by `YEAR`, ending at `E`, for the embed DOI and the chapter
 * selection. It feeds every tab; tabs render metrics once it and the metadata read have settled.
 */
export const useMetricWidgetYear = (doi: Doi) => {
	const { metricWidgetService } = useServices();
	const { data: metaData } = useMetaData(doi);
	const inputs = useDOIs(doi);
	const theme = useTheme();

	// `E` is fixed for the life of the component, so the key never moves with the clock.
	const [endDate] = useState(() => metricWidgetEndDate(new Date()));

	const input = metricWidgetInput('YEAR', inputs.doi, inputs.chapterDois, {
		endDate,
	});

	const query = useQuery({
		queryKey: metricWidgetQueryKey(input),
		queryFn: () => metricWidgetService.getMetricWidget(input),
		enabled: inputs.isQueryEnabled,
		...metricWidgetQueryOptions,
	});

	const state = useReadState(
		query,
		'YEAR',
		inputs.isChapterEmbed,
		inputs.isMetaDataSettled,
	);

	const colors = state.view
		? assignPlatformColors(state.view.platforms, theme)
		: new Map<string, PlatformColor>();
	// Only a platform missing from R-YEAR (never expected) falls back to the default token.
	const defaultColor = getColor('', theme);

	return {
		...state,
		metaData,
		doi: inputs.doi,
		chapterDois: inputs.chapterDois,
		isChapterEmbed: inputs.isChapterEmbed,
		isMetaDataSettled: inputs.isMetaDataSettled,
		/** The colour of a platform, as R-YEAR assigned it (the month view reuses it). */
		colorOf: (platformId: string) =>
			resolveColor(colors, defaultColor, platformId),
	};
};

export type MetricWidgetYear = ReturnType<typeof useMetricWidgetYear>;

/**
 * The month read (R-MONTH) of one open `YEAR` bucket, or no read when `bucket` is null. Each bucket's key has its
 * own query observer, which is never re-pointed to another key: closing a year removes its observer instead of
 * disabling it, and reopening it adds a new one, which does not send a failed read again (`retryOnMount: false`).
 */
export const useMetricWidgetMonth = (
	year: Pick<MetricWidgetYear, 'doi' | 'chapterDois' | 'isChapterEmbed'>,
	bucket: DateRange | null,
): MetricReadState => {
	const { metricWidgetService } = useServices();
	const input = bucket
		? metricWidgetInput('MONTH', year.doi, year.chapterDois, bucket)
		: null;

	const queries: UseQueryOptions<
		MetricWidgetData,
		Error,
		MetricWidgetData,
		ReturnType<typeof metricWidgetQueryKey>
	>[] = input
		? [
				{
					queryKey: metricWidgetQueryKey(input),
					queryFn: () => metricWidgetService.getMetricWidget(input),
					...metricWidgetQueryOptions,
				},
			]
		: [];

	const results = useQueries({ queries });

	return useReadState(results[0], 'MONTH', year.isChapterEmbed, true);
};
