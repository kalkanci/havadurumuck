import { describe, it, expect } from 'vitest';
import { convertTemperature, checkWeatherAlerts } from '../helpers';
import { WeatherData } from '../../types';

describe('convertTemperature', () => {
  it('should return celsius as is', () => {
    expect(convertTemperature(25, 'celsius')).toBe(25);
    expect(convertTemperature(0, 'celsius')).toBe(0);
    expect(convertTemperature(-10, 'celsius')).toBe(-10);
  });

  it('should convert celsius to fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
    expect(convertTemperature(25, 'fahrenheit')).toBe(77);
  });
});

describe('checkWeatherAlerts', () => {
  const mockWeatherData = (temp: number): WeatherData => ({
    current: {
      temperature_2m: temp,
      weather_code: 0,
      wind_speed_10m: 10,
      relative_humidity_2m: 50,
      apparent_temperature: temp,
      is_day: 1,
      precipitation: 0,
      surface_pressure: 1000,
      cloud_cover: 0,
      wind_direction_10m: 0,
      dew_point_2m: 0,
      time: new Date().toISOString()
    },
    daily: {
      uv_index_max: [5],
      precipitation_probability_max: [0],
      time: [],
      weather_code: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      apparent_temperature_max: [],
      apparent_temperature_min: [],
      sunrise: [],
      sunset: [],
      precipitation_sum: [],
      precipitation_hours: [],
      wind_speed_10m_max: [],
      wind_gusts_10m_max: [],
      wind_direction_10m_dominant: []
    },
    hourly: {
      time: [],
      temperature_2m: [],
      weather_code: [],
      is_day: [],
      wind_speed_10m: [],
      wind_direction_10m: [],
      precipitation_probability: []
    },
    latitude: 0,
    longitude: 0,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    elevation: 0,
    current_units: {}
  });

  it('should format heat alert in Celsius', () => {
    const weather = mockWeatherData(36);
    const alerts = checkWeatherAlerts(weather, 'celsius');
    const heatAlert = alerts.find(a => a.type === 'heat');

    expect(heatAlert).toBeDefined();
    expect(heatAlert?.message).toContain('36°C');
  });

  it('should format heat alert in Fahrenheit', () => {
    const weather = mockWeatherData(36);
    const alerts = checkWeatherAlerts(weather, 'fahrenheit');
    const heatAlert = alerts.find(a => a.type === 'heat');

    expect(heatAlert).toBeDefined();
    // 36 C = 96.8 F -> rounded to 97
    expect(heatAlert?.message).toContain('97°F');
  });
});
