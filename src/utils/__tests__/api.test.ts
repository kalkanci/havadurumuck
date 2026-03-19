import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return response on success', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const result = fetchWithRetry('https://api.example.com/data');
    await Promise.all([result, vi.runAllTimersAsync()]);

    expect(await result).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 500 error and eventually succeed', async () => {
    const errorResponse = new Response('error', { status: 500 });
    const successResponse = new Response('ok', { status: 200 });

    vi.mocked(fetch)
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);

    const resultPromise = fetchWithRetry('https://api.example.com/data');
    await vi.runAllTimersAsync();

    expect(await resultPromise).toBe(successResponse);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw ApiError after max retries on 500 error', async () => {
    const errorResponse = new Response('error', { status: 500 });

    vi.mocked(fetch).mockResolvedValue(errorResponse);

    const resultPromise = fetchWithRetry('https://api.example.com/data', {}, 2);

    await Promise.all([resultPromise.catch(() => {}), vi.runAllTimersAsync()]);

    await expect(resultPromise).rejects.toThrow(ApiError);
    await expect(resultPromise).rejects.toHaveProperty('status', 500);
    expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should not retry and immediately throw ApiError on 404 error', async () => {
    const errorResponse = new Response('Not Found', { status: 404 });
    vi.mocked(fetch).mockResolvedValueOnce(errorResponse);

    const resultPromise = fetchWithRetry('https://api.example.com/data');

    await expect(resultPromise).rejects.toThrow(ApiError);
    await expect(resultPromise).rejects.toHaveProperty('status', 404);
    expect(fetch).toHaveBeenCalledTimes(1); // No retries for 404
  });

  it('should throw NetworkError after max retries on network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const resultPromise = fetchWithRetry('https://api.example.com/data', {}, 1);

    await Promise.all([resultPromise.catch(() => {}), vi.runAllTimersAsync()]);

    await expect(resultPromise).rejects.toThrow(NetworkError);
    expect(fetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
  });
});
