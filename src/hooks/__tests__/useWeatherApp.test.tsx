// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWeatherApp } from '../useWeatherApp';

// Mock services
vi.mock('../../services/weatherService', () => ({
  fetchWeather: vi.fn().mockResolvedValue({ current: { temperature_2m: 20 } }),
  getDetailedAddress: vi.fn().mockResolvedValue({ city: 'Test City', countryCode: 'TC', address: 'Test Address' }),
  fetchHolidays: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../services/astronomyService', () => ({
  fetchAstronomyPicture: vi.fn().mockResolvedValue(null),
}));

// Mock helpers
vi.mock('../../utils/helpers', () => ({
  checkWeatherAlerts: vi.fn().mockReturnValue([]),
  triggerHapticFeedback: vi.fn(),
}));

describe('useWeatherApp', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();

    // Mock navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn().mockImplementation((success) =>
          success({ coords: { latitude: 40, longitude: -74 } })
        )
      },
      configurable: true,
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.location).toBeNull();
    expect(result.current.weather).toBeNull();
    expect(result.current.initialBoot).toBe(true);
    expect(result.current.settings.temperatureUnit).toBe('celsius');
  });

  it('updates location state and caches it', async () => {
    const { result } = renderHook(() => useWeatherApp());

    const newLoc = { id: 1, name: 'Paris', latitude: 48, longitude: 2, country: 'France', subtext: 'Varsayılan' };

    act(() => {
      result.current.setLocation(newLoc);
    });

    expect(result.current.location).toEqual(newLoc);
    expect(JSON.parse(localStorage.getItem('atmosfer_location') as string)).toEqual(newLoc);
  });
});
