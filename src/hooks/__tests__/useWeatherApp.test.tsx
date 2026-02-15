import { renderHook, act } from '@testing-library/react';
import { useWeatherApp } from '../useWeatherApp';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../services/weatherService', () => ({
  fetchWeather: vi.fn(),
  getDetailedAddress: vi.fn(),
  fetchHolidays: vi.fn(),
}));

vi.mock('../../services/astronomyService', () => ({
  fetchAstronomyPicture: vi.fn(),
}));

describe('useWeatherApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn()
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWeatherApp());

    expect(result.current.location).toBeNull();
    expect(result.current.weather).toBeNull();
    // initialBoot starts true, so loading is false until location action starts
    expect(result.current.settings.temperatureUnit).toBe('celsius');
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
    expect(JSON.parse(localStorage.getItem('atmosfer_settings') || '{}')).toEqual({
       hapticsEnabled: false,
       temperatureUnit: 'fahrenheit'
    });
  });
});
