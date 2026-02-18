import { describe, it, expect } from 'vitest';
import { convertTemperature, checkWeatherAlerts } from '../helpers';
import { WeatherData } from '../../types';

describe('convertTemperature', () => {
  it('should return celsius as is', () => {
    expect(convertTemperature(25, 'celsius')).toBe(25);
  });

  it('should convert to fahrenheit', () => {
    // 0C = 32F
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    // 100C = 212F
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    // 25C = 77F
    expect(convertTemperature(25, 'fahrenheit')).toBe(77);
  });
});

describe('checkWeatherAlerts', () => {
    it('should format temperature message correctly for celsius', () => {
        const mockWeather: WeatherData = {
            current: { temperature_2m: 36, weather_code: 0, wind_speed_10m: 10, precipitation: 0 } as any,
            daily: { uv_index_max: [0] } as any,
            hourly: { precipitation_probability: [] } as any,
            air_quality: { european_aqi: 20 } as any,
            latitude: 0, longitude: 0, generationtime_ms: 0, utc_offset_seconds: 0, elevation: 0, current_units: {}
        };

        const alerts = checkWeatherAlerts(mockWeather, 'celsius');
        const heatAlert = alerts.find(a => a.type === 'heat');
        expect(heatAlert).toBeDefined();
        expect(heatAlert?.message).toContain("36°C");
    });

    it('should format temperature message correctly for fahrenheit', () => {
        const mockWeather: WeatherData = {
            current: { temperature_2m: 36, weather_code: 0, wind_speed_10m: 10, precipitation: 0 } as any, // 36C is approx 97F
            daily: { uv_index_max: [0] } as any,
            hourly: { precipitation_probability: [] } as any,
            air_quality: { european_aqi: 20 } as any,
            latitude: 0, longitude: 0, generationtime_ms: 0, utc_offset_seconds: 0, elevation: 0, current_units: {}
        };

        // 36 * 9/5 + 32 = 64.8 + 32 = 96.8 -> 97
        const alerts = checkWeatherAlerts(mockWeather, 'fahrenheit');
        const heatAlert = alerts.find(a => a.type === 'heat');
        expect(heatAlert).toBeDefined();
        expect(heatAlert?.message).toContain("97°F");
    });
});
