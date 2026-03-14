export class ApiError extends Error {
  constructor(public status: number, public statusText: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

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

    if (!res.ok) {
        throw new ApiError(res.status, res.statusText, `API Error: ${res.status} ${res.statusText} for URL ${url}`);
    }

    return res;
  } catch (err) {
    if (err instanceof ApiError) {
        throw err;
    }
    // Retry on network errors
    if (retries > 0) {
        console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw new NetworkError(`Network Error: Failed to fetch ${url}. Details: ${err instanceof Error ? err.message : String(err)}`);
  }
}
