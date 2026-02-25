// @vitest-environment jsdom
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';
import * as astronomyService from '../../services/astronomyService';
import { AppError, ErrorCode } from '../../utils/AppError';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock services
vi.mock('../../services/weatherService');
vi.mock('../../services/astronomyService');

describe('useWeatherApp', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    // Mock successful astronomy fetch
    (astronomyService.fetchAstronomyPicture as any).mockResolvedValue({ url: 'http://test.com/space.jpg' });

    // Mock empty holidays
    (weatherService.fetchHolidays as any).mockResolvedValue([]);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWeatherApp());
    // initialBoot is true, loading is false initially until handleCurrentLocation runs
    expect(result.current.initialBoot).toBe(true);
    expect(result.current.weather).toBeNull();
  });

  it('should handle location error correctly (fallback to Istanbul on boot)', async () => {
    // Simulate Geolocation Error
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'User denied' });
    });

    const { result } = renderHook(() => useWeatherApp());

    await waitFor(() => {
        expect(result.current.gpsError).toBe(true);
    });

    // Should fallback to Istanbul
    expect(result.current.location?.name).toBe('İstanbul');
  });

  it('should handle API errors during weather fetch', async () => {
    // 1. Mock successful location
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
            coords: { latitude: 40, longitude: 30 }
        });
    });

    (weatherService.getDetailedAddress as any).mockResolvedValue({
        city: 'Test City', country: 'Test Country', countryCode: 'TC', address: 'Test Address'
    });

    // 2. Mock Weather Failure (AppError)
    (weatherService.fetchWeather as any).mockRejectedValue(new AppError('Server Error', ErrorCode.API));

    const { result } = renderHook(() => useWeatherApp());

    // Wait for location to be set
    await waitFor(() => expect(result.current.location?.name).toBe('Test City'));

    // Wait for error to appear
    await waitFor(() => {
        expect(result.current.error).toContain('Sunucu şu an yanıt vermiyor');
    });
  });
});
