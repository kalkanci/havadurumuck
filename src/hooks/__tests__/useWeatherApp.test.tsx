import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';

// Mocks
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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Mock navigator.clipboard (for share fallback)
const mockClipboard = {
  writeText: vi.fn(),
};
Object.defineProperty(global.navigator, 'clipboard', {
    value: mockClipboard,
    writable: true
});

// Mock Share API (initially undefined or defined)
Object.defineProperty(global.navigator, 'share', {
    value: undefined,
    writable: true
});


describe('useWeatherApp Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWeatherApp());
    expect(result.current.state.weather).toBeNull();
  });

  it('should attempt to load location on mount', async () => {
      renderHook(() => useWeatherApp());
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('should return false for shareWeather if no data', async () => {
      const { result } = renderHook(() => useWeatherApp());
      const success = await result.current.actions.shareWeather();
      expect(success).toBe(false);
  });
});
