export class ApiError extends Error {
  public status: number;
  public statusText: string;

  constructor(status: number, statusText: string, message?: string) {
    super(message || `API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export class NetworkError extends Error {
  constructor(message?: string) {
    super(message || 'Network error occurred');
    this.name = 'NetworkError';
  }
}

/**
 * Enhanced fetch with retry logic, exponential backoff, and typed errors.
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 500): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err) {
    // Retry on network errors
    if (retries > 0) {
      console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw new NetworkError(err instanceof Error ? err.message : 'Unknown network error');
  }

  // Retry on server errors (5xx) or rate limits (429)
  if (!res.ok && (res.status >= 500 || res.status === 429)) {
    if (retries > 0) {
      console.warn(`Request failed with status ${res.status}. Retrying in ${backoff}ms... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw new ApiError(res.status, res.statusText);
  }

  // If it's a 4xx error (other than 429), we typically don't retry but we should throw an ApiError.
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText);
  }

  return res;
}
