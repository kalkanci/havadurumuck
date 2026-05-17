import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry } from '../api';
import { ApiError, NetworkError } from '../errors';

describe('fetchWithRetry', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return successful response on first try', async () => {
        const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'ok' }) };
        (global.fetch as any).mockResolvedValueOnce(mockResponse);

        const response = await fetchWithRetry('https://api.example.com');
        expect(response).toBe(mockResponse);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 error and eventually succeed', async () => {
        const mockErrorResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
        const mockSuccessResponse = { ok: true, json: () => Promise.resolve({ data: 'ok' }) };

        (global.fetch as any)
            .mockResolvedValueOnce(mockErrorResponse)
            .mockResolvedValueOnce(mockSuccessResponse);

        const promise = fetchWithRetry('https://api.example.com', {}, 3, 500);

        // Advance timers for the retry wait
        await Promise.all([promise.catch(() => {}), vi.runAllTimersAsync()]);

        const response = await promise;

        expect(response).toBe(mockSuccessResponse);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw ApiError after all retries fail with 5xx', async () => {
        const mockErrorResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };

        (global.fetch as any).mockResolvedValue(mockErrorResponse);

        const promise = fetchWithRetry('https://api.example.com', {}, 2, 500);

        // advance timers multiple times to clear all retries
        for (let i = 0; i < 2; i++) {
            await Promise.all([promise.catch(() => {}), vi.runAllTimersAsync()]);
        }

        await expect(promise).rejects.toThrowError(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should throw ApiError immediately on 404 error (no retries)', async () => {
        const mockErrorResponse = { ok: false, status: 404, statusText: 'Not Found' };

        (global.fetch as any).mockResolvedValue(mockErrorResponse);

        const promise = fetchWithRetry('https://api.example.com', {}, 3, 500);

        await expect(promise).rejects.toThrowError(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error and eventually throw NetworkError', async () => {
        const networkError = new Error('Failed to fetch');

        (global.fetch as any).mockRejectedValue(networkError);

        const promise = fetchWithRetry('https://api.example.com', {}, 2, 500);

        // advance timers multiple times to clear all retries
        for (let i = 0; i < 2; i++) {
            await Promise.all([promise.catch(() => {}), vi.runAllTimersAsync()]);
        }

        await expect(promise).rejects.toThrowError(NetworkError);
        expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
});
