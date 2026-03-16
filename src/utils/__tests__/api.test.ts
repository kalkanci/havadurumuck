import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, NetworkError } from '../api';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return response when fetch succeeds immediately', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const result = await fetchWithRetry('https://example.com');
    expect(result).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 500 error and succeed', async () => {
    const errorResponse = new Response('error', { status: 500 });
    const successResponse = new Response('ok', { status: 200 });

    vi.mocked(fetch)
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);

    const promise = fetchWithRetry('https://example.com', {}, 3, 100);

    // Fast-forward timers for retry backoff
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe(successResponse);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw error after all retries fail due to network error', async () => {
    const networkError = new TypeError('Network error');
    vi.mocked(fetch).mockRejectedValue(networkError);

    const promise = fetchWithRetry('https://example.com', {}, 2, 100);

    // Use the technique mentioned in memory for vi.runAllTimersAsync() with promises
    await Promise.all([promise.catch(() => {}), vi.runAllTimersAsync()]);

    await expect(promise).rejects.toThrow(NetworkError);
    expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});
