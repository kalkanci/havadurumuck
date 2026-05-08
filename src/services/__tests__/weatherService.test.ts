import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeather } from '../weatherService';
import * as apiUtils from '../../utils/api';

vi.mock('../../utils/api', () => ({
  fetchWithRetry: vi.fn(),
}));

describe('weatherService - fetchWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully fetch weather data even when AQI fetch fails', async () => {
    const mockWeatherData = {
      current: { temperature_2m: 20 },
      hourly: {},
      daily: {}
    };

    // Mock fetchWithRetry to resolve for weather but reject for AQI
    vi.mocked(apiUtils.fetchWithRetry).mockImplementation(async (url) => {
      if (url.includes('api.open-meteo.com/v1/forecast')) {
        return {
          ok: true,
          json: async () => mockWeatherData,
        } as Response;
      }
      if (url.includes('air-quality-api.open-meteo.com')) {
        throw new Error('AQI API Error');
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    const result = await fetchWeather(41.01, 28.97);

    // Weather data should be returned, and air_quality should be undefined
    expect(result.current.temperature_2m).toBe(20);
    expect(result.air_quality).toBeUndefined();

    // Verify that both APIs were called
    expect(apiUtils.fetchWithRetry).toHaveBeenCalledTimes(2);
    expect(apiUtils.fetchWithRetry).toHaveBeenCalledWith(expect.stringContaining('api.open-meteo.com/v1/forecast'));
    expect(apiUtils.fetchWithRetry).toHaveBeenCalledWith(expect.stringContaining('air-quality-api.open-meteo.com'));
  });

  it('should successfully fetch both weather and AQI data when both succeed', async () => {
    const mockWeatherData = {
      current: { temperature_2m: 25 },
    };
    const mockAqiData = {
      current: { european_aqi: 45 },
    };

    vi.mocked(apiUtils.fetchWithRetry).mockImplementation(async (url) => {
      if (url.includes('api.open-meteo.com/v1/forecast')) {
        return {
          ok: true,
          json: async () => mockWeatherData,
        } as Response;
      }
      if (url.includes('air-quality-api.open-meteo.com')) {
        return {
          ok: true,
          json: async () => mockAqiData,
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    const result = await fetchWeather(41.01, 28.97);

    expect(result.current.temperature_2m).toBe(25);
    expect(result.air_quality).toEqual({ european_aqi: 45 });
  });

  it('should throw an error if weather fetch fails', async () => {
    vi.mocked(apiUtils.fetchWithRetry).mockImplementation(async (url) => {
      if (url.includes('api.open-meteo.com/v1/forecast')) {
        return {
          ok: false,
          status: 500,
          text: async () => 'Internal Server Error',
        } as Response;
      }
      if (url.includes('air-quality-api.open-meteo.com')) {
        return {
          ok: true,
          json: async () => ({ current: { european_aqi: 45 } }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    await expect(fetchWeather(41.01, 28.97)).rejects.toThrow('Weather fetch failed: 500');
  });
});
