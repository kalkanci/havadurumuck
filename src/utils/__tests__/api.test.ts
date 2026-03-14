import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

describe('fetchWithRetry', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should return a successful response', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: 'success' })
        });

        const res = await fetchWithRetry('https://example.com');
        expect(res.ok).toBe(true);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw an ApiError if status is 404 (no retry)', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found'
        });

        await expect(fetchWithRetry('https://example.com')).rejects.toThrow(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 error and throw ApiError after retries are exhausted', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        });

        const promise = fetchWithRetry('https://example.com', {}, 2, 100);

        // Advance timers for the retries
        await Promise.all([
            promise.catch(() => {}), // catch so it doesn't become unhandled
            vi.runAllTimersAsync()
        ]);

        await expect(promise).rejects.toThrow(ApiError);
        // Initial try + 2 retries = 3 calls
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on 429 error and throw ApiError after retries are exhausted', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests'
        });

        const promise = fetchWithRetry('https://example.com', {}, 2, 100);
        await Promise.all([
            promise.catch(() => {}),
            vi.runAllTimersAsync()
        ]);

        await expect(promise).rejects.toThrow(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on network error and throw NetworkError after retries are exhausted', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

        const promise = fetchWithRetry('https://example.com', {}, 2, 100);
        await Promise.all([
            promise.catch(() => {}),
            vi.runAllTimersAsync()
        ]);

        await expect(promise).rejects.toThrow(NetworkError);
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should succeed after failing a couple of times', async () => {
        let attempts = 0;
        global.fetch = vi.fn().mockImplementation(() => {
            attempts++;
            if (attempts < 3) {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    statusText: 'Server Error'
                });
            }
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ data: 'success' })
            });
        });

        const promise = fetchWithRetry('https://example.com', {}, 3, 100);
        await Promise.all([
            promise,
            vi.runAllTimersAsync()
        ]);

        const res = await promise;
        expect(res.ok).toBe(true);
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });
});
