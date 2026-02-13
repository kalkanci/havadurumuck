import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeather, searchCity } from '../weatherService';
import { AppError, ErrorCode } from '../../utils/errors';
import * as api from '../../utils/api';

// Mock fetchWithRetry
vi.mock('../../utils/api', () => ({
  fetchWithRetry: vi.fn(),
}));

describe('weatherService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchWeather', () => {
    it('should throw AppError with API_ERROR code when API returns non-ok status', async () => {
      // Mock both weather and aqi calls
      const mockResponse = {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      };

      // We expect 2 calls. Both return fail here.
      vi.mocked(api.fetchWithRetry).mockResolvedValue(mockResponse as any);

      await expect(fetchWeather(10, 10)).rejects.toThrow(AppError);

      try {
        await fetchWeather(10, 10);
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        if (e instanceof AppError) {
          expect(e.code).toBe(ErrorCode.API_ERROR);
          expect(e.statusCode).toBe(500);
        }
      }
    });

    it('should throw AppError with NETWORK_ERROR code on network failure', async () => {
      // Simulate network error (fetch throws TypeError)
      vi.mocked(api.fetchWithRetry).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(fetchWeather(10, 10)).rejects.toThrow(AppError);

      try {
        await fetchWeather(10, 10);
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        if (e instanceof AppError) {
           expect(e.code).toBe(ErrorCode.NETWORK_ERROR);
        }
      }
    });
  });

  describe('searchCity', () => {
    it('should return empty array on error instead of throwing', async () => {
        vi.mocked(api.fetchWithRetry).mockRejectedValue(new Error('Boom'));

        const result = await searchCity('test');
        expect(result).toEqual([]);
    });

    it('should return empty array on API error', async () => {
        vi.mocked(api.fetchWithRetry).mockResolvedValue({
            ok: false,
            status: 404
        } as any);

        const result = await searchCity('test');
        expect(result).toEqual([]);
    });
  });
});
