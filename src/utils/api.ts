/**
 * Enhanced fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 500, timeout = 5000): Promise<Response> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    // If a signal was passed in options, respect it too (chain it)
    if (options.signal) {
        options.signal.addEventListener('abort', () => {
            controller.abort();
            clearTimeout(id);
        });
    }

    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);

    // Retry on server errors (5xx) or rate limits (429)
    if (!res.ok && (res.status >= 500 || res.status === 429)) {
        if (retries > 0) {
            console.warn(`Request failed with status ${res.status}. Retrying in ${backoff}ms... (${retries} attempts left)`);
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2, timeout);
        }
    }
    return res;
  } catch (err) {
    // Retry on network errors
    if (retries > 0) {
        console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2, timeout);
    }
    throw err;
  }
}
