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
    vi.clearAllMocks();
  });

  it('should return response when fetch is successful', async () => {
    const mockResponse = new Response('ok', { status: 200, statusText: 'OK' });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const res = await fetchWithRetry('https://example.com');
    expect(res).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw NetworkError when fetch fails completely due to network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'));

    const promise = fetchWithRetry('https://example.com', {}, 2, 100);

    // we must catch it inline with runAllTimers to avoid Unhandled Rejection
    const catchPromise = expect(promise).rejects.toThrow(NetworkError);
    await vi.runAllTimersAsync();
    await catchPromise;

    // 1 initial + 2 retries = 3 calls
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('should throw ApiError with status 500 when fetch returns 500 error after retries', async () => {
    const mockResponse = new Response('error', { status: 500, statusText: 'Internal Server Error' });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('https://example.com', {}, 2, 100);

    const catchPromise = expect(promise).rejects.toThrow(ApiError);
    await vi.runAllTimersAsync();
    await catchPromise;

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('should throw ApiError with status 429 when fetch returns 429 error after retries', async () => {
    const mockResponse = new Response('rate limited', { status: 429, statusText: 'Too Many Requests' });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('https://example.com', {}, 1, 100);

    const catchPromise = expect(promise).rejects.toThrow(ApiError);
    await vi.runAllTimersAsync();
    await catchPromise;

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw ApiError without retry for 4xx errors other than 429', async () => {
    const mockResponse = new Response('not found', { status: 404, statusText: 'Not Found' });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('https://example.com', {}, 2, 100);

    await expect(promise).rejects.toThrow(ApiError);
    await expect(promise).rejects.toThrow(/API Error 404/);
    expect(fetch).toHaveBeenCalledTimes(1); // No retries for 404
  });

  it('should succeed if a retry works after an initial failure', async () => {
    const mockErrorResponse = new Response('error', { status: 500, statusText: 'Internal Server Error' });
    const mockSuccessResponse = new Response('ok', { status: 200, statusText: 'OK' });

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockErrorResponse)
      .mockResolvedValueOnce(mockSuccessResponse);

    const promise = fetchWithRetry('https://example.com', {}, 2, 100);

    // We should await runAllTimersAsync to handle the internal setTimeout
    const [res] = await Promise.all([
      promise,
      vi.runAllTimersAsync()
    ]);

    expect(res).toBe(mockSuccessResponse);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
