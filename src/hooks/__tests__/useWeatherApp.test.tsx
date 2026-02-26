
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';
import * as astronomyService from '../../services/astronomyService';

// Mock Services
vi.mock('../../services/weatherService', () => ({
  fetchWeather: vi.fn(),
  getDetailedAddress: vi.fn(),
  fetchHolidays: vi.fn(),
}));

vi.mock('../../services/astronomyService', () => ({
  fetchAstronomyPicture: vi.fn(),
}));

// Mock Navigator Geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

global.navigator.geolocation = mockGeolocation as any;

// Mock LocalStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useWeatherApp Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();

    // Default mocks
    (weatherService.fetchHolidays as any).mockResolvedValue([]);
    (astronomyService.fetchAstronomyPicture as any).mockResolvedValue(null);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.location).toBeNull();
    expect(result.current.weather).toBeNull();
    // loading might be true if initial boot triggers location fetch immediately
    // but default state check is usually before effects run fully or if we assume no stored location
    expect(result.current.initialBoot).toBe(true);
  });

  it('should handle successful geolocation and weather fetch', async () => {
    // 1. Mock Geolocation Success
    const mockPosition = {
      coords: { latitude: 41.0, longitude: 29.0 }
    };
    mockGeolocation.getCurrentPosition.mockImplementation((success) => success(mockPosition));

    // 2. Mock Address Lookup
    (weatherService.getDetailedAddress as any).mockResolvedValue({
      city: 'Istanbul',
      country: 'Turkey',
      countryCode: 'TR',
      address: 'Test Address'
    });

    // 3. Mock Weather Fetch
    const mockWeather = {
      current: { temperature_2m: 20, weather_code: 0, is_day: 1 },
      daily: {
          uv_index_max: [5],
          precipitation_probability_max: [10],
          sunrise: ['2023-01-01T06:00'],
          sunset: ['2023-01-01T18:00']
      },
      hourly: {
          precipitation_probability: [0,0,0]
      },
      latitude: 41.0,
      longitude: 29.0
    };
    (weatherService.fetchWeather as any).mockResolvedValue(mockWeather);

    const { result } = renderHook(() => useWeatherApp());

    // Trigger Initial Location Load
    // In the hook, handleCurrentLocation sets loading=true if !initialBoot,
    // but on initialBoot it relies on the flow.
    // Let's simulate a manual trigger after initial mount or wait for the effect.

    // Actually, on mount, if no location, it calls handleCurrentLocation.
    // So we just wait for the result.

    await waitFor(() => {
        expect(result.current.location?.name).toBe('Istanbul');
    });

    // Wait for Weather Load (triggered by location change)
    await waitFor(() => {
        expect(result.current.weather).toEqual(mockWeather);
    });
  });

  it('should handle GPS error and fallback', async () => {
    // Mock Geolocation Error
    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => error({ code: 1, message: 'User denied' }));

    const { result } = renderHook(() => useWeatherApp());

    // Wait for the fallback to happen automatically on mount
    await waitFor(() => {
        expect(result.current.gpsError).toBe(true);
    });

    // Should fallback to Istanbul if it's initial boot
    // Note: The hook uses 'İstanbul' (with dotted I) for fallback, check code.
    expect(result.current.location?.name).toBe('İstanbul');
  });

  it('should manage favorites', () => {
    const { result } = renderHook(() => useWeatherApp());

    const newLoc = {
        id: 123,
        name: 'Ankara',
        latitude: 39.9,
        longitude: 32.8,
        country: 'Turkey'
    };

    act(() => {
        result.current.addFavorite(newLoc);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].name).toBe('Ankara');

    act(() => {
        result.current.removeFavorite(123);
    });

    expect(result.current.favorites).toHaveLength(0);
  });
});
