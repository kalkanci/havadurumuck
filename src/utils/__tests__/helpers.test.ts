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
  const baseWeather: WeatherData = {
    current: {
      temperature_2m: 20,
      relative_humidity_2m: 50,
      apparent_temperature: 20,
      is_day: 1,
      precipitation: 0,
      weather_code: 0,
      cloud_cover: 0,
      pressure_msl: 1013,
      surface_pressure: 1013,
      wind_speed_10m: 10,
      wind_direction_10m: 180,
      dew_point_2m: 10,
    },
    daily: {
      temperature_2m_max: [25],
      temperature_2m_min: [15],
      apparent_temperature_max: [25],
      apparent_temperature_min: [15],
      sunrise: [''],
      sunset: [''],
      uv_index_max: [5],
      precipitation_probability_max: [0],
      precipitation_sum: [0],
      precipitation_hours: [0],
      wind_speed_10m_max: [10],
      wind_gusts_10m_max: [15],
      wind_direction_10m_dominant: [180],
      weather_code: [0],
    },
    hourly: {
      temperature_2m: [],
      weather_code: [],
      is_day: [],
      wind_speed_10m: [],
      wind_direction_10m: [],
      precipitation_probability: [],
      uv_index: [],
      relative_humidity_2m: [],
      apparent_temperature: [],
      surface_pressure: [],
      pressure_msl: [],
    },
    latitude: 0,
    longitude: 0,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    elevation: 0,
    current_units: {},
  };

  it('should format heat alert in Celsius', () => {
    const weather = {
      ...baseWeather,
      current: { ...baseWeather.current, temperature_2m: 40 },
    };
    const alerts = checkWeatherAlerts(weather, 'celsius');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].message).toContain("Sıcaklık 40°C'ye ulaştı");
  });

  it('should format heat alert in Fahrenheit', () => {
    const weather = {
      ...baseWeather,
      current: { ...baseWeather.current, temperature_2m: 40 },
    };
    const alerts = checkWeatherAlerts(weather, 'fahrenheit');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].message).toContain("Sıcaklık 104°F'ye ulaştı");
  });
});
