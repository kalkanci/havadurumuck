import { renderHook, waitFor } from '@testing-library/react';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';
import * as astronomyService from '../../services/astronomyService';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks
vi.mock('../../services/weatherService');
vi.mock('../../services/astronomyService');

// Mock scroll
window.scrollTo = vi.fn();

describe('useWeatherApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(localStorage.getItem).mockReturnValue(null);
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useWeatherApp());
        // Since initialBoot is true, it triggers handleCurrentLocation immediately
        // but initially location is null
        expect(result.current.location).toBeNull();
        expect(result.current.initialBoot).toBe(true);
    });

    it('should fetch location and weather on mount', async () => {
        // Setup mocks
        const mockCoords = { latitude: 41.0, longitude: 29.0 };
        const mockDetails = {
            city: 'Istanbul',
            country: 'Turkey',
            countryCode: 'TR',
            address: 'Besiktas, Istanbul'
        };
        const mockWeather = {
            current: { temperature_2m: 20, weather_code: 0, is_day: 1 },
            daily: { temperature_2m_max: [25], temperature_2m_min: [15] },
            hourly: {},
            generationtime_ms: 10
        };

        // Mock geolocation success
        (navigator.geolocation.getCurrentPosition as any).mockImplementation((success: any) =>
            success({ coords: mockCoords })
        );

        vi.mocked(weatherService.getDetailedAddress).mockResolvedValue(mockDetails as any);
        vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeather as any);
        vi.mocked(weatherService.fetchHolidays).mockResolvedValue([]);
        vi.mocked(astronomyService.fetchAstronomyPicture).mockResolvedValue({ url: 'test.jpg' } as any);

        const { result } = renderHook(() => useWeatherApp());

        // Wait for location to be set
        await waitFor(() => {
            expect(result.current.location).toBeTruthy();
        });

        expect(result.current.location?.name).toBe('Istanbul');
        expect(result.current.location?.latitude).toBe(41.0);

        // Wait for weather to be loaded
        await waitFor(() => {
            expect(result.current.weather).toEqual(mockWeather);
        }, { timeout: 2000 });

        expect(weatherService.fetchWeather).toHaveBeenCalledWith(41.0, 29.0);
    });
});
