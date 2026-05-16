import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry } from '../api';
import { ApiError, NetworkError } from '../errors';

// Mock the global fetch
const originalFetch = global.fetch;

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  it('should return successful response on first try', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'success' }), { status: 200 });
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

    const response = await fetchWithRetry('http://test.com');
    expect(response).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw ApiError for 404 response without retrying', async () => {
    const mockResponse = new Response('Not Found', { status: 404 });
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

    await expect(fetchWithRetry('http://test.com')).rejects.toThrowError(ApiError);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 500 error and eventually throw ApiError if it continues to fail', async () => {
    const mockResponse = new Response('Server Error', { status: 500 });
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('http://test.com', {}, 2, 100);

    // Fast-forward timers
    await Promise.all([
      promise.catch(() => {}),
      vi.runAllTimersAsync()
    ]);

    await expect(promise).rejects.toThrowError(ApiError);
    // 1 initial + 2 retries = 3 total calls
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should retry on network error and eventually throw NetworkError', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

    const promise = fetchWithRetry('http://test.com', {}, 1, 100);

    await Promise.all([
      promise.catch(() => {}),
      vi.runAllTimersAsync()
    ]);

    await expect(promise).rejects.toThrowError(NetworkError);
    // 1 initial + 1 retry = 2 total calls
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should succeed after failing initially (retry success)', async () => {
    const errorResponse = new Response('Server Error', { status: 500 });
    const successResponse = new Response(JSON.stringify({ data: 'success' }), { status: 200 });

    global.fetch = vi.fn()
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);

    const promise = fetchWithRetry('http://test.com', {}, 3, 100);

    await vi.runAllTimersAsync();

    const response = await promise;
    expect(response).toBe(successResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
