export class ApiError extends Error {
  status: number;
  url: string;
  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

export class NetworkError extends Error {
  url: string;
  constructor(message: string, url: string) {
    super(message);
    this.name = 'NetworkError';
    this.url = url;
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
        // If out of retries, throw ApiError
        throw new ApiError(`Request failed with status ${res.status}`, res.status, url);
    }

    // For other non-OK statuses (like 400, 401, 404), throw immediately
    if (!res.ok) {
        throw new ApiError(`Request failed with status ${res.status}`, res.status, url);
    }

    return res;
  } catch (err) {
    // Do not retry if the error is already an ApiError (e.g. 404)
    if (err instanceof ApiError) {
        throw err;
    }

    // Retry on network errors
    if (retries > 0) {
        console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    throw new NetworkError(`Network error while fetching ${url}`, url);
  }
}
