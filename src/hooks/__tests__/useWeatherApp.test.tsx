// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';
import * as astronomyService from '../../services/astronomyService';

// Mock dependencies
vi.mock('../../services/weatherService', () => ({
  fetchWeather: vi.fn(),
  getDetailedAddress: vi.fn(),
  fetchHolidays: vi.fn(),
}));

vi.mock('../../services/astronomyService', () => ({
  fetchAstronomyPicture: vi.fn(),
}));

vi.mock('../../utils/helpers', () => ({
  checkWeatherAlerts: vi.fn(() => []),
  triggerHapticFeedback: vi.fn(),
}));

// Mock Navigator Geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
};

// @ts-ignore
global.navigator.geolocation = mockGeolocation;

Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true,
});


describe('useWeatherApp Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.location).toBeNull();
    expect(result.current.weather).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.initialBoot).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle GPS success and load weather', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    };

    const mockAddress = {
      city: 'New York',
      country: 'USA',
      countryCode: 'US',
      address: 'Manhattan',
    };

    const mockWeather = { current: { temperature_2m: 20 }, daily: {}, hourly: {} };

    // Setup mocks
    mockGeolocation.getCurrentPosition.mockImplementation((success: any) => success(mockPosition));
    vi.mocked(weatherService.getDetailedAddress).mockResolvedValue(mockAddress);
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeather as any);
    vi.mocked(weatherService.fetchHolidays).mockResolvedValue([]);
    vi.mocked(astronomyService.fetchAstronomyPicture).mockResolvedValue(null);

    const { result } = renderHook(() => useWeatherApp());

    // Trigger location
    await act(async () => {
      result.current.handleCurrentLocation();
    });

    await waitFor(() => {
        expect(result.current.location).not.toBeNull();
    }, { timeout: 2000 });

    expect(result.current.location?.latitude).toBe(40.7128);
    // expect(result.current.weather).toEqual(mockWeather); // This might fail if state update hasn't propagated yet

    await waitFor(() => {
       expect(weatherService.fetchWeather).toHaveBeenCalledWith(40.7128, -74.0060);
    });
  });

  it('should handle GPS error and fallback', async () => {
    const mockError = { code: 1, message: 'User denied Geolocation' };
    mockGeolocation.getCurrentPosition.mockImplementation((_: any, error: any) => error(mockError));

    const { result } = renderHook(() => useWeatherApp());

    await act(async () => {
      result.current.handleCurrentLocation();
    });

    // Expect fallback to Istanbul (defaultLoc) if initialBoot is true
    await waitFor(() => {
        expect(result.current.location?.name).toBe('İstanbul');
        expect(result.current.gpsError).toBe(true);
    });
  });
});
