// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

const MOCK_URL = 'https://api.test.com/data';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should return successful response immediately', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'ok' }), { status: 200 });
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const res = await fetchWithRetry(MOCK_URL);
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(MOCK_URL, {});
  });

  it('should throw ApiError after retries for 500 status', async () => {
    const mockResponse = new Response('Server Error', { status: 500 });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const promise = fetchWithRetry(MOCK_URL, {}, 2, 100);

    // Initial fetch + 2 retries = 3 fetches
    // Use Promise.all to advance timers concurrently while the promise is pending
    await Promise.all([
      promise.catch(() => {}),
      (async () => {
        await vi.runAllTimersAsync();
      })()
    ]);

    await expect(promise).rejects.toThrow(ApiError);
    await expect(promise).rejects.toThrow('API responded with status 500');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('should throw NetworkError after retries for network failures', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'));

    const promise = fetchWithRetry(MOCK_URL, {}, 2, 100);

    await Promise.all([
      promise.catch(() => {}),
      (async () => {
        await vi.runAllTimersAsync();
      })()
    ]);

    await expect(promise).rejects.toThrow(NetworkError);
    await expect(promise).rejects.toThrow('Network request failed: Failed to fetch');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('should not retry on 404 client error and throw ApiError immediately', async () => {
    const mockResponse = new Response('Not Found', { status: 404 });
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const promise = fetchWithRetry(MOCK_URL, {}, 3, 100);

    await expect(promise).rejects.toThrow(ApiError);
    await expect(promise).rejects.toThrow('API responded with status 404');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should succeed after initial failure', async () => {
    const mockErrorResponse = new Response('Rate Limited', { status: 429 });
    const mockSuccessResponse = new Response('Success', { status: 200 });

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockErrorResponse)
      .mockResolvedValueOnce(mockSuccessResponse);

    const promise = fetchWithRetry(MOCK_URL, {}, 2, 100);

    await Promise.all([
      promise,
      (async () => {
        await vi.runAllTimersAsync();
      })()
    ]);

    const res = await promise;
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
