import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';
import * as astronomyService from '../../services/astronomyService';

// Mock services
vi.mock('../../services/weatherService');
vi.mock('../../services/astronomyService');

describe('useWeatherApp', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // @ts-ignore
    global.navigator.geolocation = mockGeolocation;

    // Default mock implementations
    vi.mocked(weatherService.fetchHolidays).mockResolvedValue([]);
    vi.mocked(astronomyService.fetchAstronomyPicture).mockResolvedValue(null);
    vi.mocked(weatherService.getDetailedAddress).mockResolvedValue({
        city: 'Test City',
        country: 'Test Country',
        countryCode: 'TC',
        address: 'Test Address'
    });

    // Full mock for weather data to prevent crashes in helpers
    vi.mocked(weatherService.fetchWeather).mockResolvedValue({
        latitude: 10,
        longitude: 20,
        generationtime_ms: 0,
        utc_offset_seconds: 0,
        timezone: 'GMT',
        timezone_abbreviation: 'GMT',
        elevation: 0,
        current_units: {},
        current: {
            weather_code: 0, is_day: 1, temperature_2m: 20,
            wind_speed_10m: 10, relative_humidity_2m: 50,
            apparent_temperature: 20, precipitation: 0,
            cloud_cover: 0, pressure_msl: 1000, surface_pressure: 1000,
            wind_direction_10m: 0, dew_point_2m: 10,
            time: '2023-01-01T12:00'
        },
        daily: {
            time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [],
            uv_index_max: [5], precipitation_probability_max: [0],
            apparent_temperature_max: [], apparent_temperature_min: [],
            sunrise: [], sunset: [], precipitation_sum: [], precipitation_hours: [],
            wind_speed_10m_max: [], wind_gusts_10m_max: [], wind_direction_10m_dominant: []
        },
        hourly: {
            time: [], temperature_2m: [], precipitation_probability: [0, 0, 0],
            weather_code: [], is_day: [], wind_speed_10m: [], wind_direction_10m: [],
            uv_index: [], relative_humidity_2m: [], apparent_temperature: [],
            surface_pressure: [], pressure_msl: []
        },
        air_quality: { european_aqi: 20 }
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.location).toBeNull();
    expect(result.current.weather).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.initialBoot).toBe(true);
    expect(result.current.settings.temperatureUnit).toBe('celsius');
  });

  it('should load settings from localStorage', () => {
    localStorage.setItem('atmosfer_settings', JSON.stringify({
      hapticsEnabled: false,
      temperatureUnit: 'fahrenheit'
    }));

    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.settings.hapticsEnabled).toBe(false);
    expect(result.current.settings.temperatureUnit).toBe('fahrenheit');
  });

  it('should handle location error correctly', async () => {
    // Mock geolocation error
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: 'User denied Geolocation' });
    });

    const { result } = renderHook(() => useWeatherApp());

    // Trigger location check (it happens on mount, but we can verify the outcome)
    await waitFor(() => {
        // Since initialBoot is true, it sets default location (Istanbul) instead of error
        expect(result.current.location?.name).toBe('İstanbul');
        expect(result.current.gpsError).toBe(true);
    });
  });

  it('should add and remove favorites', () => {
    const { result } = renderHook(() => useWeatherApp());

    const mockLoc = {
        id: 123,
        name: 'Test City',
        latitude: 10,
        longitude: 20,
        country: 'Test Country',
        countryCode: 'TC',
        admin1: 'Region',
        subtext: 'Details'
    };

    act(() => {
        result.current.addFavorite(mockLoc);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]).toEqual(mockLoc);

    act(() => {
        result.current.removeFavorite(123);
    });

    expect(result.current.favorites).toHaveLength(0);
  });

  it('should update settings', () => {
    const { result } = renderHook(() => useWeatherApp());

    act(() => {
        result.current.setSettings({
            hapticsEnabled: false,
            temperatureUnit: 'fahrenheit'
        });
    });

    expect(result.current.settings.temperatureUnit).toBe('fahrenheit');
    expect(localStorage.getItem('atmosfer_settings')).toContain('fahrenheit');
  });
});
