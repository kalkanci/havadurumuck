import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

const MOCK_URL = 'https://api.example.com/data';

describe('fetchWithRetry', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should return response when fetch is successful', async () => {
        const mockResponse = { ok: true, status: 200, json: async () => ({}) } as Response;
        vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

        const response = await fetchWithRetry(MOCK_URL);

        expect(response).toBe(mockResponse);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw ApiError when response is not ok (e.g., 404)', async () => {
        const mockResponse = { ok: false, status: 404 } as Response;
        vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

        await expect(fetchWithRetry(MOCK_URL)).rejects.toThrowError(ApiError);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 error and succeed if subsequent request is ok', async () => {
        const mockErrorResponse = { ok: false, status: 500 } as Response;
        const mockSuccessResponse = { ok: true, status: 200 } as Response;

        vi.mocked(fetch)
            .mockResolvedValueOnce(mockErrorResponse)
            .mockResolvedValueOnce(mockSuccessResponse);

        const promise = fetchWithRetry(MOCK_URL, {}, 3, 500);

        // Advance timer for the first retry backoff
        await vi.runAllTimersAsync();

        const response = await promise;

        expect(response).toBe(mockSuccessResponse);
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw ApiError after exhausting retries on 500 errors', async () => {
        const mockErrorResponse = { ok: false, status: 500 } as Response;

        // Mock fetch to always return 500
        vi.mocked(fetch).mockResolvedValue(mockErrorResponse);

        // We allow 2 retries (so 3 requests total)
        const promise = fetchWithRetry(MOCK_URL, {}, 2, 500);

        // Advance timers for all retries concurrently with waiting for the promise rejection
        await Promise.all([
            expect(promise).rejects.toThrowError(ApiError),
            vi.runAllTimersAsync()
        ]);

        expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on network error and succeed if subsequent request works', async () => {
        const mockSuccessResponse = { ok: true, status: 200 } as Response;

        vi.mocked(fetch)
            .mockRejectedValueOnce(new Error('Failed to fetch'))
            .mockResolvedValueOnce(mockSuccessResponse);

        const promise = fetchWithRetry(MOCK_URL, {}, 3, 500);

        // Run timers
        await vi.runAllTimersAsync();

        const response = await promise;

        expect(response).toBe(mockSuccessResponse);
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw NetworkError after exhausting retries on network errors', async () => {
        // Mock fetch to always throw a network error
        vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'));

        // We allow 2 retries (so 3 requests total)
        const promise = fetchWithRetry(MOCK_URL, {}, 2, 500);

        // Advance timers for all retries concurrently with catching the error
        await Promise.all([
            expect(promise).rejects.toThrowError(NetworkError),
            vi.runAllTimersAsync()
        ]);

        expect(fetch).toHaveBeenCalledTimes(3);
    });
});
