import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';
import * as astronomyService from '../../services/astronomyService';

// Mock Services
vi.mock('../../services/weatherService');
vi.mock('../../services/astronomyService');

// Mock helpers
vi.mock('../../utils/helpers', () => ({
  checkWeatherAlerts: vi.fn().mockReturnValue([]),
  triggerHapticFeedback: vi.fn(),
  calculateDistance: vi.fn().mockReturnValue(10)
}));

describe('useWeatherApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Geolocation
        const mockGeolocation = {
            getCurrentPosition: vi.fn().mockImplementation((success) =>
                success({
                    coords: { latitude: 41.0, longitude: 29.0 },
                    timestamp: 123
                })
            ),
            watchPosition: vi.fn(),
            clearWatch: vi.fn()
        };
        Object.defineProperty(global.navigator, 'geolocation', {
            value: mockGeolocation,
            writable: true
        });

        // Mock Service Responses
        (weatherService.getDetailedAddress as any).mockResolvedValue({
            city: 'Istanbul', country: 'Türkiye', countryCode: 'TR', address: 'Test Addr'
        });
        (weatherService.fetchWeather as any).mockResolvedValue({
            current: { temperature_2m: 20, weather_code: 1 },
            daily: { temperature_2m_max: [25], temperature_2m_min: [15] },
            hourly: { precipitation_probability: [] }
        });
        (weatherService.fetchHolidays as any).mockResolvedValue([]);
        (astronomyService.fetchAstronomyPicture as any).mockResolvedValue({
            url: 'test.jpg'
        });
    });

    it('should initialize with loading state and fetch location', async () => {
        const { result } = renderHook(() => useWeatherApp());

        // Initial state
        expect(result.current.initialBoot).toBe(true);
        expect(result.current.location).toBeNull();

        // Wait for location fetch
        await waitFor(() => {
            expect(result.current.location).not.toBeNull();
        });

        expect(result.current.location?.name).toBe('Istanbul');
    });

    it('should load weather data when location is set', async () => {
        const { result } = renderHook(() => useWeatherApp());

        await waitFor(() => {
            expect(result.current.weather).not.toBeNull();
        });

        expect(result.current.weather?.current.temperature_2m).toBe(20);
    });

    it('should handle favorites', async () => {
        const { result } = renderHook(() => useWeatherApp());

        await waitFor(() => expect(result.current.location).not.toBeNull());

        const loc = result.current.location!;

        act(() => {
            result.current.addFavorite(loc);
        });

        expect(result.current.favorites).toHaveLength(1);
        expect(result.current.favorites[0].id).toBe(loc.id);

        act(() => {
            result.current.removeFavorite(loc.id);
        });

        expect(result.current.favorites).toHaveLength(0);
    });
});
