import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, 'fetch');
    // Suppress console.warn for cleaner test output
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return response on successful fetch', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    (global.fetch as vi.Mock).mockResolvedValueOnce(mockResponse);

    const response = await fetchWithRetry('https://example.com');
    expect(response).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw ApiError on non-retriable HTTP error (e.g., 404)', async () => {
    const mockResponse = new Response('not found', { status: 404 });
    (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('https://example.com');
    // For 404 it doesn't await timers, so we can just await the promise
    await expect(promise).rejects.toThrow(ApiError);
    await expect(fetchWithRetry('https://example.com')).rejects.toHaveProperty('status', 404);

    // Two separate calls to fetchWithRetry
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should retry on 500 error and eventually throw ApiError if retries exhausted', async () => {
    const mockResponse = new Response('server error', { status: 500 });
    (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('https://example.com', {}, 2, 100);

    // Use Promise.all to catch the rejection while advancing timers
    await expect(
        Promise.all([
            promise,
            vi.runAllTimersAsync()
        ])
    ).rejects.toThrow(ApiError);

    // Initial request + 2 retries = 3 calls
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should throw NetworkError on fetch failure after retries exhausted', async () => {
    const networkError = new Error('Failed to fetch');
    (global.fetch as vi.Mock).mockRejectedValue(networkError);

    const promise = fetchWithRetry('https://example.com', {}, 1, 100);

    // Use Promise.all to catch the rejection while advancing timers
    await expect(
        Promise.all([
            promise,
            vi.runAllTimersAsync()
        ])
    ).rejects.toThrow(NetworkError);

    // Initial request + 1 retry = 2 calls
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should resolve if it succeeds during a retry', async () => {
    const failResponse = new Response('error', { status: 500 });
    const successResponse = new Response('ok', { status: 200 });

    (global.fetch as vi.Mock)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(successResponse);

    const promise = fetchWithRetry('https://example.com', {}, 3, 100);

    // Need to advance timers for each failure
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);

    const response = await promise;
    expect(response).toBe(successResponse);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
