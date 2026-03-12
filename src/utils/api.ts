/**
 * Custom error class for API response errors (e.g., 404, 500)
 */
export class ApiError extends Error {
  public status: number;
  public url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

/**
 * Custom error class for Network-related failures (e.g., no internet)
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Enhanced fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 500): Promise<Response> {
  try {
    const res = await fetch(url, options);

    // Retry on server errors (5xx) or rate limits (429)
    if (!res.ok && (res.status >= 500 || res.status === 429)) {
        if (retries > 0) {
            console.warn(`Request failed with status ${res.status}. Retrying in ${backoff}ms... (${retries} attempts left)`);
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
    }

    // If response is still not OK after retries, throw ApiError
    if (!res.ok) {
        throw new ApiError(`API request failed with status ${res.status}`, res.status, url);
    }

    return res;
  } catch (err) {
    // If the error is already an ApiError (thrown above), just rethrow it
    if (err instanceof ApiError) {
        throw err;
    }

    // Retry on network errors
    if (retries > 0) {
        console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    throw new NetworkError(err instanceof Error ? err.message : 'Network request failed');
  }
}
