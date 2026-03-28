/**
 * Custom Error for API Responses (!res.ok)
 */
export class ApiError extends Error {
  public status: number;
  public url: string;

  constructor(status: number, statusText: string, url: string) {
    super(`API Error: ${status} ${statusText} for ${url}`);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

/**
 * Custom Error for Network Failures (e.g. offline, DNS)
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

    if (!res.ok) {
        // Retry on server errors (5xx) or rate limits (429)
        if ((res.status >= 500 || res.status === 429) && retries > 0) {
            console.warn(`Request failed with status ${res.status}. Retrying in ${backoff}ms... (${retries} attempts left)`);
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        // Exhausted retries or non-retriable error (e.g., 400, 401, 404)
        throw new ApiError(res.status, res.statusText, url);
    }

    return res;
  } catch (err) {
    // If we already wrapped it in ApiError, just rethrow
    if (err instanceof ApiError) {
        throw err;
    }

    // Retry on network errors
    if (retries > 0) {
        console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    // Exhausted retries for network error
    throw new NetworkError(err instanceof Error ? err.message : 'Network request failed');
  }
}
