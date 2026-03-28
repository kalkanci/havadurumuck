import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return response on success', async () => {
    const mockResponse = new Response(null, { status: 200 });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    const res = await fetchWithRetry('https://example.com');
    expect(res).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on network error and eventually throw NetworkError', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network failure'));

    const promise = fetchWithRetry('https://example.com', {}, 2, 100);

    // Resolve retries with fake timers
    await Promise.all([
      promise.catch(() => {}),
      (async () => {
        await vi.runAllTimersAsync();
      })()
    ]);

    await expect(promise).rejects.toThrow(NetworkError);
    // 1 initial + 2 retries
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should retry on 5xx server error and eventually throw ApiError', async () => {
    const mockResponse = new Response(null, { status: 500, statusText: 'Internal Server Error' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('https://example.com', {}, 2, 100);

    // Resolve retries with fake timers
    await Promise.all([
      promise.catch(() => {}),
      (async () => {
        await vi.runAllTimersAsync();
      })()
    ]);

    await expect(promise).rejects.toThrow(ApiError);
    // 1 initial + 2 retries
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should throw ApiError immediately on non-retriable error (e.g., 404)', async () => {
    const mockResponse = new Response(null, { status: 404, statusText: 'Not Found' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    await expect(fetchWithRetry('https://example.com')).rejects.toThrow(ApiError);
    // Only 1 call, no retries
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should succeed after failing initially (retry success)', async () => {
      const errorResponse = new Response(null, { status: 500 });
      const successResponse = new Response(null, { status: 200 });

      (global.fetch as ReturnType<typeof vi.fn>)
          .mockResolvedValueOnce(errorResponse)
          .mockResolvedValueOnce(successResponse);

      const promise = fetchWithRetry('https://example.com', {}, 2, 100);

      await Promise.all([
         vi.runAllTimersAsync(),
      ]);

      const res = await promise;
      expect(res.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
