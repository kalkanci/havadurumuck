import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWeatherApp } from '../useWeatherApp';
import * as weatherService from '../../services/weatherService';
import * as astronomyService from '../../services/astronomyService';
import { GeoLocation, WeatherData } from '../../types';

// Mock Services
vi.mock('../../services/weatherService');
vi.mock('../../services/astronomyService');
vi.mock('../../utils/helpers', async () => {
    const actual = await vi.importActual('../../utils/helpers');
    return {
        ...actual,
        triggerHapticFeedback: vi.fn(),
    };
});

describe('useWeatherApp Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (astronomyService.fetchAstronomyPicture as any).mockResolvedValue(null);
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useWeatherApp());

        expect(result.current.state.loading).toBe(false);
        expect(result.current.state.location).toBeNull();
        expect(result.current.state.weather).toBeNull();
        expect(result.current.state.error).toBeNull();
        expect(result.current.state.initialBoot).toBe(true);
    });

    it('should handle location error when geolocation is not supported or fails', async () => {
        // Mock geolocation failure
        (global.navigator.geolocation.getCurrentPosition as any).mockImplementation((success, error) => {
            error({
                code: 1, // PERMISSION_DENIED
                message: 'User denied Geolocation'
            });
        });

        // Mock weather for fallback location to prevent errors in logs
        const mockWeather: WeatherData = {
            current: { temperature_2m: 20, weather_code: 1, is_day: 1, wind_speed_10m: 10, precipitation: 0 } as any,
            daily: { temperature_2m_max: [25], temperature_2m_min: [15], uv_index_max: [5], precipitation_probability_max: [0] } as any,
            hourly: { precipitation_probability: [0, 0, 0] } as any,
            latitude: 41.0138,
            longitude: 28.9497,
            generationtime_ms: 0,
            utc_offset_seconds: 0,
            elevation: 0,
            current_units: {} as any
        };
        (weatherService.fetchWeather as any).mockResolvedValue(mockWeather);
        (weatherService.fetchHolidays as any).mockResolvedValue([]);


        const { result } = renderHook(() => useWeatherApp());

        // Wait for initial boot logic
        await waitFor(() => {
            expect(result.current.state.gpsError).toBe(true);
        });

        // Should fallback to Istanbul
        expect(result.current.state.location?.name).toBe('İstanbul');
    });

    it('should fetch weather when location is set', async () => {
        const mockLocation: GeoLocation = {
            id: 1,
            name: 'Test City',
            latitude: 10,
            longitude: 20,
            country: 'Test Country',
            countryCode: 'TC',
            admin1: 'Test Region',
            subtext: 'Test Subtext'
        };

        const mockWeather: WeatherData = {
            current: { temperature_2m: 20, weather_code: 1, is_day: 1, wind_speed_10m: 10, precipitation: 0 } as any,
            daily: { temperature_2m_max: [25], temperature_2m_min: [15], uv_index_max: [5], precipitation_probability_max: [0] } as any,
            hourly: { precipitation_probability: [0, 0, 0] } as any,
            latitude: 10,
            longitude: 20,
            generationtime_ms: 0,
            utc_offset_seconds: 0,
            elevation: 0,
            current_units: {} as any
        };

        (weatherService.getDetailedAddress as any).mockResolvedValue({
            city: 'Test City',
            address: 'Test Subtext',
            country: 'Test Country',
            countryCode: 'TC'
        });

        (weatherService.fetchWeather as any).mockResolvedValue(mockWeather);
        (weatherService.fetchHolidays as any).mockResolvedValue([]);

        // Mock geolocation success
        (global.navigator.geolocation.getCurrentPosition as any).mockImplementation((success) => {
            success({
                coords: {
                    latitude: 10,
                    longitude: 20
                }
            });
        });

        const { result } = renderHook(() => useWeatherApp());

        // Should trigger location set and then weather fetch
        await waitFor(() => {
            expect(result.current.state.location).not.toBeNull();
        });

        expect(result.current.state.location?.name).toBe('Test City');

        await waitFor(() => {
            expect(result.current.state.weather).toEqual(mockWeather);
        });

        expect(weatherService.fetchWeather).toHaveBeenCalledWith(10, 20);
    });
});
