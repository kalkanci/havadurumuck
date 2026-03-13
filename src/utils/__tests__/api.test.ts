import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

describe('api utility tests', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        originalFetch = global.fetch;
        vi.useFakeTimers();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it('should return successful response immediately', async () => {
        const mockResponse = new Response('ok', { status: 200 });
        global.fetch = vi.fn().mockResolvedValue(mockResponse);

        const res = await fetchWithRetry('https://example.com');
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(res.status).toBe(200);
    });

    it('should retry on 500 error and eventually succeed', async () => {
        const mockErrorResponse = new Response('error', { status: 500 });
        const mockSuccessResponse = new Response('ok', { status: 200 });

        global.fetch = vi.fn()
            .mockResolvedValueOnce(mockErrorResponse)
            .mockResolvedValueOnce(mockSuccessResponse);

        const fetchPromise = fetchWithRetry('https://example.com', {}, 2, 100);
        await vi.runAllTimersAsync();
        const res = await fetchPromise;

        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(res.status).toBe(200);
    });

    it('should throw ApiError after exhausting retries on 500 error', async () => {
        const mockErrorResponse = new Response('error', { status: 500, statusText: 'Internal Server Error' });
        global.fetch = vi.fn().mockResolvedValue(mockErrorResponse);

        const fetchPromise = fetchWithRetry('https://example.com', {}, 2, 100);
        await Promise.all([
             expect(fetchPromise).rejects.toThrow(ApiError),
             vi.runAllTimersAsync()
        ]);

        expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should throw ApiError immediately on 404 error (non-retriable)', async () => {
        const mockErrorResponse = new Response('not found', { status: 404, statusText: 'Not Found' });
        global.fetch = vi.fn().mockResolvedValue(mockErrorResponse);

        const fetchPromise = fetchWithRetry('https://example.com', {}, 3, 100);

        await expect(fetchPromise).rejects.toThrow(ApiError);
        await expect(fetchPromise).rejects.toThrow('HTTP Error 404: Not Found');
        expect(global.fetch).toHaveBeenCalledTimes(1); // No retries for 404
    });

    it('should retry on network error and eventually succeed', async () => {
        const mockSuccessResponse = new Response('ok', { status: 200 });
        global.fetch = vi.fn()
            .mockRejectedValueOnce(new TypeError('Failed to fetch'))
            .mockResolvedValueOnce(mockSuccessResponse);

        const fetchPromise = fetchWithRetry('https://example.com', {}, 2, 100);
        await vi.runAllTimersAsync();
        const res = await fetchPromise;

        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(res.status).toBe(200);
    });

    it('should throw NetworkError after exhausting retries on network error', async () => {
        global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

        const fetchPromise = fetchWithRetry('https://example.com', {}, 2, 100);
        await Promise.all([
             expect(fetchPromise).rejects.toThrow(NetworkError),
             vi.runAllTimersAsync()
        ]);

        expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
});
