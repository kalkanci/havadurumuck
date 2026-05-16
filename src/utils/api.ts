import { ApiError, NetworkError } from './errors';

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

    // Throw ApiError for non-ok HTTP responses when retries are exhausted (or not applicable)
    if (!res.ok) {
        throw new ApiError(`API request failed with status ${res.status}`, res.status, url);
    }

    return res;
  } catch (err) {
    // Retry on network errors
    if (retries > 0 && !(err instanceof ApiError)) {
        console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    if (err instanceof ApiError) {
        throw err;
    }

    throw new NetworkError('Network request failed', err);
  }
}
