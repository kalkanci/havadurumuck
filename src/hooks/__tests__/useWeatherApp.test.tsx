import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '@/services/weatherService';
import * as astronomyService from '@/services/astronomyService';

// Mock dependencies
vi.mock('@/services/weatherService');
vi.mock('@/services/astronomyService');

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
global.navigator.geolocation = mockGeolocation as any;

describe('useWeatherApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock returns
    (weatherService.fetchHolidays as any).mockResolvedValue([]);
    (astronomyService.fetchAstronomyPicture as any).mockResolvedValue(null);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.loading).toBe(false);
    expect(result.current.weather).toBeNull();
    expect(result.current.location).toBeNull();
  });

  it('should handle GPS location success', async () => {
    // Mock getDetailedAddress
    const mockAddress = { city: 'Test City', country: 'Test Country', countryCode: 'TC', address: 'Test Addr' };
    (weatherService.getDetailedAddress as any).mockResolvedValue(mockAddress);

    // Mock fetchWeather with complete structure to avoid helper crashes
    (weatherService.fetchWeather as any).mockResolvedValue({
        current: {
            temperature_2m: 20,
            weather_code: 0,
            wind_speed_10m: 10,
            relative_humidity_2m: 50,
            precipitation: 0,
            is_day: 1
        },
        daily: {
            temperature_2m_max: [25],
            temperature_2m_min: [15],
            uv_index_max: [5],
            precipitation_sum: [0],
            wind_speed_10m_max: [15],
            weather_code: [0]
        },
        hourly: {
            temperature_2m: [],
            precipitation_probability: []
        },
        air_quality: {
             european_aqi: 20
        }
    });

    // Mock geolocation success
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
        success({ coords: { latitude: 10, longitude: 20 } })
    );

    const { result } = renderHook(() => useWeatherApp());

    // Trigger location fetch
    act(() => {
        result.current.handleCurrentLocation();
    });

    await waitFor(() => {
        expect(result.current.location).not.toBeNull();
    });

    expect(result.current.location?.name).toBe('Test City');
  });

  it('should handle API errors with Toast', async () => {
     // Mock getDetailedAddress
     const mockAddress = { city: 'Test City', country: 'Test Country', countryCode: 'TC', address: 'Test Addr' };
     (weatherService.getDetailedAddress as any).mockResolvedValue(mockAddress);

     // Mock geolocation success
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
        success({ coords: { latitude: 10, longitude: 20 } })
    );

    // Mock fetchWeather failure
    (weatherService.fetchWeather as any).mockRejectedValue(new Error('API Fail'));

    const { result } = renderHook(() => useWeatherApp());

    act(() => {
        result.current.handleCurrentLocation();
    });

    // Wait for location to be set, which triggers weather load
    await waitFor(() => {
         expect(result.current.location).not.toBeNull();
    });

    // Wait for error handling
    await waitFor(() => {
        // Either error state or toast should be set
        expect(result.current.error).toBeTruthy();
    });
  });
});
