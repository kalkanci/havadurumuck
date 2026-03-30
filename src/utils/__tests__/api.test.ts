import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

describe('fetchWithRetry', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should return successful response without retries', async () => {
        const mockResponse = new Response('ok', { status: 200 });
        vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

        const response = await fetchWithRetry('http://test.com');
        expect(response).toBe(mockResponse);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw ApiError and retry on 500 error', async () => {
        const errorResponse = new Response('error', { status: 500 });
        vi.mocked(global.fetch).mockResolvedValue(errorResponse);

        const promise = fetchWithRetry('http://test.com', {}, 2, 500);

        // Handle rejection concurrently to avoid unhandled promise rejection
        await Promise.all([
            promise.catch(() => {}),
            vi.runAllTimersAsync()
        ]);

        await expect(promise).rejects.toThrow(ApiError);
        // Initial fetch + 2 retries
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw NetworkError on network failure', async () => {
        vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

        const promise = fetchWithRetry('http://test.com', {}, 2, 500);

        // Advance timers for all retries
        await Promise.all([
            promise.catch(() => {}),
            vi.runAllTimersAsync()
        ]);

        await expect(promise).rejects.toThrow(NetworkError);
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 404 error and throw ApiError immediately', async () => {
        const notFoundResponse = new Response('not found', { status: 404 });
        vi.mocked(global.fetch).mockResolvedValue(notFoundResponse);

        const promise = fetchWithRetry('http://test.com');

        await Promise.all([
            promise.catch(() => {}),
            vi.runAllTimersAsync()
        ]);

        await expect(promise).rejects.toThrow(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});
