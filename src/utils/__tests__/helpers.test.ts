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
  const mockWeather: any = {
    current: { temperature_2m: 38, weather_code: 0, wind_speed_10m: 10, precipitation: 0 },
    daily: { uv_index_max: [5] },
    hourly: { precipitation_probability: [0, 0, 0] }
  };

  it('should return alerts in Celsius by default', () => {
    const alerts = checkWeatherAlerts(mockWeather as WeatherData);
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert?.message).toContain('38°C');
  });

  it('should return alerts in Fahrenheit when specified', () => {
    const alerts = checkWeatherAlerts(mockWeather as WeatherData, 'fahrenheit');
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert?.message).toContain('100°F');
  });
});

describe('generateSmartAdvice', () => {
  const mockWeatherHeat: any = {
    current: { temperature_2m: 35, weather_code: 0, wind_speed_10m: 10, is_day: 1 },
    daily: { precipitation_probability_max: [0] },
    air_quality: null
  };

  const mockWeatherCold: any = {
    current: { temperature_2m: 2, weather_code: 0, wind_speed_10m: 10, is_day: 1 },
    daily: { precipitation_probability_max: [0] },
    air_quality: null
  };

  it('should format heat advice correctly in celsius', () => {
    const advice = generateSmartAdvice(mockWeatherHeat as WeatherData, 'celsius');
    expect(advice.advice).toContain('35°C');
  });

  it('should format heat advice correctly in fahrenheit', () => {
    const advice = generateSmartAdvice(mockWeatherHeat as WeatherData, 'fahrenheit');
    expect(advice.advice).toContain('95°F');
  });

  it('should format cold advice correctly in celsius', () => {
    const advice = generateSmartAdvice(mockWeatherCold as WeatherData, 'celsius');
    expect(advice.advice).toContain('2°C');
  });

  it('should format cold advice correctly in fahrenheit', () => {
    const advice = generateSmartAdvice(mockWeatherCold as WeatherData, 'fahrenheit');
    expect(advice.advice).toContain('36°F');
  });
});
