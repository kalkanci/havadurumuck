import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
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

    it('should return a valid response when fetch is successful', async () => {
        const mockResponse = new Response('{"data": "ok"}', { status: 200 });
        vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

        const res = await fetchWithRetry('https://api.example.com');
        expect(res.status).toBe(200);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw ApiError without retries for 400 Bad Request', async () => {
        const mockResponse = new Response('Bad Request', { status: 400, statusText: 'Bad Request' });
        vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

        await expect(fetchWithRetry('https://api.example.com')).rejects.toThrow(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(1); // 400s don't trigger retries
    });

    it('should retry on 500 Server Error and throw ApiError if retries run out', async () => {
        const mockResponse = new Response('Server Error', { status: 500, statusText: 'Server Error' });
        vi.mocked(global.fetch).mockResolvedValue(mockResponse); // Fail every time

        const promise = fetchWithRetry('https://api.example.com', {}, 2, 100);

        // Wait out the timers for the 2 retries
        await Promise.all([
            promise.catch(() => {}),
            vi.runAllTimersAsync()
        ]);

        await expect(promise).rejects.toThrow(ApiError);
        expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should throw NetworkError if fetch fails entirely (network issue)', async () => {
        const networkError = new TypeError('Failed to fetch');
        vi.mocked(global.fetch).mockRejectedValue(networkError);

        const promise = fetchWithRetry('https://api.example.com', {}, 1, 100);

        await Promise.all([
            promise.catch(() => {}),
            vi.runAllTimersAsync()
        ]);

        await expect(promise).rejects.toThrow(NetworkError);
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });
});
