import { describe, it, expect } from 'vitest';
import { convertTemperature, checkWeatherAlerts, generateSmartAdvice } from '../helpers';
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
  const mockWeather: WeatherData = {
    current: {
      temperature_2m: 38, // Trigger heat alert
      weather_code: 0,
      wind_speed_10m: 10,
      precipitation: 0,
      relative_humidity_2m: 50,
      apparent_temperature: 38,
      is_day: 1,
      cloud_cover: 0,
      wind_direction_10m: 0,
      dew_point_2m: 10,
      surface_pressure: 1013,
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
      precipitation_probability: [0, 0, 0],
      time: [],
      temperature_2m: [],
      weather_code: [],
      is_day: [],
      wind_speed_10m: [],
      wind_direction_10m: []
    },
    latitude: 0,
    longitude: 0,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    elevation: 0,
    current_units: {}
  };

  it('should format heat warning in celsius by default', () => {
    const alerts = checkWeatherAlerts(mockWeather);
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert).toBeDefined();
    expect(heatAlert?.message).toContain("38°C'ye ulaştı");
  });

  it('should format heat warning in fahrenheit when unit is fahrenheit', () => {
    const alerts = checkWeatherAlerts(mockWeather, 'fahrenheit');
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert).toBeDefined();
    // 38°C is roughly 100°F
    expect(heatAlert?.message).toContain("100°F'ye ulaştı");
  });
});

describe('generateSmartAdvice', () => {
  const mockWeather: WeatherData = {
    current: {
      temperature_2m: 25,
      weather_code: 0,
      wind_speed_10m: 5,
      precipitation: 0,
      relative_humidity_2m: 50,
      apparent_temperature: 25,
      is_day: 1,
      cloud_cover: 0,
      wind_direction_10m: 0,
      dew_point_2m: 10,
      surface_pressure: 1013,
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
      precipitation_probability: [0, 0, 0],
      time: [],
      temperature_2m: [],
      weather_code: [],
      is_day: [],
      wind_speed_10m: [],
      wind_direction_10m: []
    },
    latitude: 0,
    longitude: 0,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    elevation: 0,
    current_units: {}
  };

  it('should generate advice without crashing when celsius unit is used', () => {
    const advice = generateSmartAdvice(mockWeather, 'celsius');
    expect(advice).toBeDefined();
    expect(advice.mood).toBeDefined();
    expect(advice.advice).toBeDefined();
  });

  it('should generate advice without crashing when fahrenheit unit is used', () => {
    const advice = generateSmartAdvice(mockWeather, 'fahrenheit');
    expect(advice).toBeDefined();
    expect(advice.mood).toBeDefined();
    expect(advice.advice).toBeDefined();
  });
});
