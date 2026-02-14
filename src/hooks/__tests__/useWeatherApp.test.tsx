import { renderHook, waitFor } from '@testing-library/react';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';
import { AppError, ErrorCode } from '../../utils/errors';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Services
vi.mock('../../services/weatherService', () => ({
  fetchWeather: vi.fn(),
  getDetailedAddress: vi.fn(),
  fetchHolidays: vi.fn(),
}));

vi.mock('../../services/astronomyService', () => ({
  fetchAstronomyPicture: vi.fn(),
}));

describe('useWeatherApp Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (weatherService.fetchHolidays as any).mockResolvedValue([]);
    (weatherService.getDetailedAddress as any).mockResolvedValue({
        city: 'Test City',
        address: 'Test Address',
        country: 'Test Country',
        countryCode: 'TC'
    });

    // Mock global navigator
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) =>
        success({ coords: { latitude: 40, longitude: -74 } })
      ),
      watchPosition: vi.fn(),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWeatherApp());
    expect(result.current.loading).toBe(false); // Initially false until effect runs
    expect(result.current.weather).toBeNull();
    expect(result.current.location).toBeNull();
  });

  it('should load location on mount', async () => {
    const { result } = renderHook(() => useWeatherApp());

    // Initially loading might be false or true depending on initialBoot logic
    // But verify location is eventually set
    await waitFor(() => {
        expect(result.current.location).not.toBeNull();
        expect(result.current.location?.name).toBe('Test City');
    });
  });

  it('should handle weather fetch error', async () => {
    // Mock weather failure
    (weatherService.fetchWeather as any).mockRejectedValue(
        new AppError('API Error', ErrorCode.API_ERROR)
    );

    const { result } = renderHook(() => useWeatherApp());

    // Wait for location to be set (which triggers weather load)
    await waitFor(() => {
       expect(result.current.location).not.toBeNull();
    });

    // Wait for error to appear
    await waitFor(() => {
       expect(result.current.error).toBe('API Error');
    });
  });
});
