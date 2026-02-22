// @vitest-environment jsdom
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWeatherApp } from '../useWeatherApp';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as weatherService from '../../services/weatherService';
import * as astronomyService from '../../services/astronomyService';

// Mock dependencies
vi.mock('../../services/weatherService');
vi.mock('../../services/astronomyService');

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
global.navigator.geolocation = mockGeolocation as any;

describe('useWeatherApp Hook', () => {
  const mockLocation = {
    city: 'Test City',
    address: 'Test Address',
    country: 'Test Country',
    countryCode: 'TC'
  };

  const mockWeather = {
    latitude: 10,
    longitude: 20,
    generationtime_ms: 0.1,
    utc_offset_seconds: 0,
    timezone: 'GMT',
    timezone_abbreviation: 'GMT',
    elevation: 10,
    current_units: {},
    current: {
      time: '2023-01-01T12:00',
      interval: 900,
      temperature_2m: 20,
      weather_code: 1, // Sunny
      is_day: 1
    },
    hourly: { time: [], temperature_2m: [] },
    daily: { time: [], weather_code: [] }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (weatherService.getDetailedAddress as any).mockResolvedValue(mockLocation);
    (weatherService.fetchWeather as any).mockResolvedValue(mockWeather);
    (weatherService.fetchHolidays as any).mockResolvedValue([]);
    (astronomyService.fetchAstronomyPicture as any).mockResolvedValue(null);

    // Mock localStorage
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { store[key] = value; });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.location).toBeNull();
    expect(result.current.weather).toBeNull();
    expect(result.current.loading).toBe(false); // Initially false, then true when effect runs? No, effect runs after render.
    expect(result.current.initialBoot).toBe(true);
  });

  it('should fetch location and weather on mount', async () => {
    // Mock successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 10,
          longitude: 20,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      });
    });

    const { result } = renderHook(() => useWeatherApp());

    // Wait for location to be set (triggered by effect -> handleCurrentLocation)
    await waitFor(() => {
      expect(result.current.location).not.toBeNull();
    });

    expect(result.current.location?.name).toBe('Test City');
    expect(weatherService.getDetailedAddress).toHaveBeenCalledWith(10, 20);

    // Wait for weather to be loaded (triggered by location change)
    await waitFor(() => {
      expect(result.current.weather).not.toBeNull();
    });

    expect(result.current.weather).toEqual(mockWeather);
    expect(weatherService.fetchWeather).toHaveBeenCalledWith(10, 20);
  });

  it('should handle GPS error and fallback (if implemented)', async () => {
    // Mock geolocation error
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({
        code: 1,
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      });
    });

    const { result } = renderHook(() => useWeatherApp());

    await waitFor(() => {
      // Expect either error state or fallback location
      // Hook logic: fallback to Istanbul on initial boot failure
      expect(result.current.location).not.toBeNull();
      expect(result.current.location?.name).toBe('İstanbul');
      expect(result.current.gpsError).toBe(true);
    });
  });

  it('should add and remove favorites', () => {
    const { result } = renderHook(() => useWeatherApp());

    const newLoc = {
        id: 123,
        name: 'New City',
        latitude: 30,
        longitude: 40,
        country: 'Country',
        countryCode: 'CC',
        admin1: 'Admin'
    };

    act(() => {
        result.current.addFavorite(newLoc);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]).toEqual(newLoc);

    act(() => {
        result.current.removeFavorite(123);
    });

    expect(result.current.favorites).toHaveLength(0);
  });

  it('should update settings', () => {
      const { result } = renderHook(() => useWeatherApp());

      act(() => {
          result.current.setSettings({
              ...result.current.settings,
              temperatureUnit: 'fahrenheit'
          });
      });

      expect(result.current.settings.temperatureUnit).toBe('fahrenheit');
  });
});
