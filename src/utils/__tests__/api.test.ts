import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, ApiError, NetworkError } from '../api';

describe('fetchWithRetry', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should return a successful response on first try', async () => {
    const mockResponse = { ok: true, status: 200, json: async () => ({}) } as Response;
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('http://example.com');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw ApiError for non-ok status (e.g. 404) without retrying', async () => {
    const mockResponse = { ok: false, status: 404, statusText: 'Not Found', url: 'http://example.com' } as Response;
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const promise = fetchWithRetry('http://example.com');
    await expect(Promise.all([promise, vi.runAllTimersAsync()])).rejects.toThrow(ApiError);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 500 error and then succeed', async () => {
    const errorResponse = { ok: false, status: 500, statusText: 'Server Error', url: 'http://example.com' } as Response;
    const successResponse = { ok: true, status: 200 } as Response;

    global.fetch = vi.fn()
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);

    const promise = fetchWithRetry('http://example.com', {}, 1, 100);
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw ApiError if retries are exhausted for 500 error', async () => {
    const errorResponse = { ok: false, status: 500, statusText: 'Server Error', url: 'http://example.com' } as Response;
    global.fetch = vi.fn().mockResolvedValue(errorResponse);

    const promise = fetchWithRetry('http://example.com', {}, 2, 100);
    await expect(Promise.all([promise, vi.runAllTimersAsync()])).rejects.toThrow(ApiError);
    expect(global.fetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should retry on 429 rate limit error', async () => {
    const rateLimitResponse = { ok: false, status: 429, statusText: 'Too Many Requests', url: 'http://example.com' } as Response;
    const successResponse = { ok: true, status: 200 } as Response;

    global.fetch = vi.fn()
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse);

    const promise = fetchWithRetry('http://example.com', {}, 1, 100);
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw NetworkError on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const promise = fetchWithRetry('http://example.com', {}, 1, 100);
    await expect(Promise.all([promise, vi.runAllTimersAsync()])).rejects.toThrow(NetworkError);
    expect(global.fetch).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
  });
});
