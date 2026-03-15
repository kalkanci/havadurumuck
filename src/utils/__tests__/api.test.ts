import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

describe('fetchWithRetry', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should return successful response without retries', async () => {
        const mockResponse = { ok: true, status: 200, json: async () => ({ data: 'test' }) };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const response = await fetchWithRetry('https://api.example.com/data');
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(response.ok).toBe(true);
    });

    it('should throw ApiError immediately for 404', async () => {
        const mockResponse = { ok: false, status: 404 };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await expect(fetchWithRetry('https://api.example.com/data')).rejects.toThrow(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 and then throw ApiError', async () => {
        const mockResponse = { ok: false, status: 500 };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const promise = fetchWithRetry('https://api.example.com/data', {}, 2, 100);

        // Wait for all retries to exhaust
        await Promise.all([promise.catch(() => {}), vi.runAllTimersAsync()]);

        await expect(promise).rejects.toThrow(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should retry on network error and then throw NetworkError', async () => {
        const mockError = new Error('Failed to fetch');
        (global.fetch as any).mockRejectedValue(mockError);

        const promise = fetchWithRetry('https://api.example.com/data', {}, 2, 100);

        // Wait for all retries to exhaust
        await Promise.all([promise.catch(() => {}), vi.runAllTimersAsync()]);

        await expect(promise).rejects.toThrow(NetworkError);
        expect(global.fetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should succeed after one retry on 500', async () => {
        const mockErrorResponse = { ok: false, status: 500 };
        const mockSuccessResponse = { ok: true, status: 200, json: async () => ({}) };

        (global.fetch as any)
            .mockResolvedValueOnce(mockErrorResponse)
            .mockResolvedValueOnce(mockSuccessResponse);

        const promise = fetchWithRetry('https://api.example.com/data', {}, 2, 100);

        await Promise.all([promise.catch(() => {}), vi.runAllTimersAsync()]);

        const response = await promise;
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(response.ok).toBe(true);
    });

});
