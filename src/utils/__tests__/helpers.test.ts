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

describe('checkWeatherAlerts and generateSmartAdvice units', () => {
  const mockWeather: WeatherData = {
    latitude: 0,
    longitude: 0,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    elevation: 0,
    current_units: {},
    current: {
      temperature_2m: 36, // Heat alert
      weather_code: 0,
      wind_speed_10m: 10,
      time: '',
      relative_humidity_2m: 0,
      apparent_temperature: 0,
      is_day: 1,
      precipitation: 0,
      surface_pressure: 0,
      cloud_cover: 0,
      wind_direction_10m: 0,
      dew_point_2m: 0
    },
    daily: {
      uv_index_max: [5],
      time: [],
      weather_code: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      apparent_temperature_max: [],
      apparent_temperature_min: [],
      sunrise: [],
      sunset: [],
      precipitation_probability_max: [0],
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
    }
  };

  it('checkWeatherAlerts should use celsius by default', () => {
    const alerts = checkWeatherAlerts(mockWeather);
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert?.message).toContain('36°C');
  });

  it('checkWeatherAlerts should format to fahrenheit', () => {
    const alerts = checkWeatherAlerts(mockWeather, 'fahrenheit');
    const heatAlert = alerts.find(a => a.type === 'heat');
    // 36C -> 96.8F (round to 97)
    expect(heatAlert?.message).toContain('97°F');
  });

  it('generateSmartAdvice should format to fahrenheit', () => {
    const advice = generateSmartAdvice(mockWeather, 'fahrenheit');
    expect(advice.advice).toContain('97°F');
  });
});
