import { AppError, ErrorCode } from './errors';

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
        if (res.status === 429) {
            throw new AppError('Çok fazla istek yapıldı.', ErrorCode.RATE_LIMIT);
        }
        throw new AppError(`Sunucu hatası: ${res.status}`, ErrorCode.API_ERROR);
    }
    return res;
  } catch (err) {
    if (err instanceof AppError) throw err;

    // Retry on network errors
    if (retries > 0) {
        console.warn(`Request failed with network error. Retrying in ${backoff}ms... (${retries} attempts left)`, err);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    throw new AppError('Ağ bağlantısı hatası.', ErrorCode.NETWORK_ERROR, err);
  }
}
