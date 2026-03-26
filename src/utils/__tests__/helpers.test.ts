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
      temperature_2m: 38,
      weather_code: 0,
      wind_speed_10m: 10,
      is_day: 1,
      precipitation: 0,
      relative_humidity_2m: 50,
      apparent_temperature: 40,
      surface_pressure: 1010,
      cloud_cover: 0,
      wind_direction_10m: 180,
      dew_point_2m: 10,
      time: '2023-01-01T12:00:00Z',
    },
    daily: {
      uv_index_max: [5],
      precipitation_probability_max: [0],
      time: ['2023-01-01'],
      weather_code: [0],
      temperature_2m_max: [38],
      temperature_2m_min: [20],
      apparent_temperature_max: [40],
      apparent_temperature_min: [20],
      sunrise: ['2023-01-01T06:00:00Z'],
      sunset: ['2023-01-01T18:00:00Z'],
      precipitation_sum: [0],
      precipitation_hours: [0],
      wind_speed_10m_max: [10],
      wind_gusts_10m_max: [15],
      wind_direction_10m_dominant: [180],
    },
    hourly: {
      precipitation_probability: [0, 0, 0],
      time: ['2023-01-01T12:00:00Z'],
      temperature_2m: [38],
      weather_code: [0],
      is_day: [1],
      wind_speed_10m: [10],
      wind_direction_10m: [180],
    },
    latitude: 0,
    longitude: 0,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    elevation: 0,
    current_units: {}
  };

  it('formats extreme heat warning in celsius by default', () => {
    const alerts = checkWeatherAlerts(mockWeather);
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert?.message).toContain('38°C');
  });

  it('formats extreme heat warning in fahrenheit when unit is passed', () => {
    const alerts = checkWeatherAlerts(mockWeather, 'fahrenheit');
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert?.message).toContain('100°F');
  });
});

describe('generateSmartAdvice', () => {
  const mockWeather: WeatherData = {
    current: {
      temperature_2m: 35,
      weather_code: 0,
      wind_speed_10m: 10,
      is_day: 1,
      precipitation: 0,
      relative_humidity_2m: 50,
      apparent_temperature: 37,
      surface_pressure: 1010,
      cloud_cover: 0,
      wind_direction_10m: 180,
      dew_point_2m: 10,
      time: '2023-01-01T12:00:00Z',
    },
    daily: {
      uv_index_max: [5],
      precipitation_probability_max: [0],
      time: ['2023-01-01'],
      weather_code: [0],
      temperature_2m_max: [35],
      temperature_2m_min: [20],
      apparent_temperature_max: [37],
      apparent_temperature_min: [20],
      sunrise: ['2023-01-01T06:00:00Z'],
      sunset: ['2023-01-01T18:00:00Z'],
      precipitation_sum: [0],
      precipitation_hours: [0],
      wind_speed_10m_max: [10],
      wind_gusts_10m_max: [15],
      wind_direction_10m_dominant: [180],
    },
    hourly: {
      precipitation_probability: [0, 0, 0],
      time: ['2023-01-01T12:00:00Z'],
      temperature_2m: [35],
      weather_code: [0],
      is_day: [1],
      wind_speed_10m: [10],
      wind_direction_10m: [180],
    },
    latitude: 0,
    longitude: 0,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    elevation: 0,
    current_units: {}
  };

  it('formats extreme heat advice in celsius by default', () => {
    const advice = generateSmartAdvice(mockWeather);
    expect(advice.advice).toContain('35°C');
  });

  it('formats extreme heat advice in fahrenheit when unit is passed', () => {
    const advice = generateSmartAdvice(mockWeather, 'fahrenheit');
    expect(advice.advice).toContain('95°F');
  });

  it('formats extreme cold advice in fahrenheit when unit is passed', () => {
    const coldWeather = {
      ...mockWeather,
      current: { ...mockWeather.current, temperature_2m: -5 }
    };
    const advice = generateSmartAdvice(coldWeather, 'fahrenheit');
    expect(advice.advice).toContain('23°F');
  });
});
