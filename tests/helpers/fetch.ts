import { vi } from 'vitest';

export const jsonResponse = (body: unknown, status = 200): Response =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});

/** Replaces the global `fetch` with a `vi.fn` (restored by tests/setup.ts). */
export const stubFetch = (
	impl: (...args: unknown[]) => Promise<Response> = async () =>
		jsonResponse({ data: [] }),
) => {
	const fetchMock = vi.fn(impl);

	vi.stubGlobal('fetch', fetchMock);

	return fetchMock;
};

export const requestedUrls = (fetchMock: ReturnType<typeof stubFetch>) =>
	fetchMock.mock.calls.map(([url]) => String(url));
