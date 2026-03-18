export class ApiError extends Error {
  constructor(public status: number, public message: string, public url: string) {
    super(`[${status}] ${message} at ${url}`);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(public message: string, public url: string) {
    super(`${message} at ${url}`);
    this.name = 'NetworkError';
  }
}

/**
 * Enhanced fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 500): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: any) {
    // Retry on network errors
    if (retries > 0) {
        console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw new NetworkError(err.message || 'Failed to fetch', url);
  }

  // Retry on server errors (5xx) or rate limits (429)
  if (!res.ok) {
      if ((res.status >= 500 || res.status === 429) && retries > 0) {
          console.warn(`Request failed with status ${res.status}. Retrying in ${backoff}ms... (${retries} attempts left)`);
          await new Promise(r => setTimeout(r, backoff));
          return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new ApiError(res.status, res.statusText || 'API Error', url);
  }

  return res;
}
