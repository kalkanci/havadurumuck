// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { useWeatherApp } from '../useWeatherApp';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as weatherService from '../../services/weatherService';

vi.mock('../../services/weatherService', () => ({
  fetchWeather: vi.fn(),
  getDetailedAddress: vi.fn(),
  fetchHolidays: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../services/astronomyService', () => ({
  fetchAstronomyPicture: vi.fn().mockResolvedValue({ url: 'test-url' }),
}));

describe('useWeatherApp hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default settings', () => {
    const { result } = renderHook(() => useWeatherApp());
    expect(result.current.settings).toEqual({ hapticsEnabled: true, temperatureUnit: 'celsius' });
  });

  it('updates location and clears weather', () => {
    const { result } = renderHook(() => useWeatherApp());
    const mockLocation = { id: 1, name: 'Test', latitude: 0, longitude: 0, country: 'Test' };

    act(() => {
      result.current.setLocation(mockLocation);
    });

    expect(result.current.location).toEqual(mockLocation);
    expect(result.current.weather).toBeNull();
  });

  it('toggles favorites correctly', () => {
    const { result } = renderHook(() => useWeatherApp());
    const mockLocation = { id: 1, name: 'Test', latitude: 0, longitude: 0, country: 'Test' };

    act(() => {
      result.current.addFavorite(mockLocation);
    });

    expect(result.current.favorites).toContainEqual(mockLocation);

    act(() => {
      result.current.removeFavorite(1);
    });

    expect(result.current.favorites).toHaveLength(0);
  });
});
