import { describe, it, expect } from 'vitest';
import { convertTemperature, generateSmartAdvice, checkWeatherAlerts } from '../helpers';

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

describe('generateSmartAdvice', () => {
  const mockWeatherBase: any = {
    current: {
      temperature_2m: 35, // > 32 to trigger "Kavurucu"
      weather_code: 0,
      wind_speed_10m: 10,
      is_day: 1
    },
    daily: {
      precipitation_probability_max: [0]
    },
    air_quality: { european_aqi: 20 }
  };

  it('formats Kavurucu advice correctly in celsius', () => {
    const advice = generateSmartAdvice(mockWeatherBase, 'celsius');
    expect(advice.mood).toBe('Kavurucu');
    expect(advice.advice).toContain('35°C');
  });

  it('formats Kavurucu advice correctly in fahrenheit', () => {
    const advice = generateSmartAdvice(mockWeatherBase, 'fahrenheit');
    expect(advice.mood).toBe('Kavurucu');
    expect(advice.advice).toContain('95°F'); // 35 * 9/5 + 32 = 95
  });
});

describe('checkWeatherAlerts', () => {
  const mockWeatherAlertBase: any = {
    current: {
      temperature_2m: 38, // > 35 to trigger heat warning
      weather_code: 0,
      wind_speed_10m: 10,
      precipitation: 0
    },
    daily: {
      uv_index_max: [5]
    },
    hourly: {
      precipitation_probability: [0, 0, 0]
    }
  };

  it('formats heat alert correctly in celsius', () => {
    const alerts = checkWeatherAlerts(mockWeatherAlertBase, 'celsius');
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert).toBeDefined();
    expect(heatAlert?.message).toContain('38°C');
  });

  it('formats heat alert correctly in fahrenheit', () => {
    const alerts = checkWeatherAlerts(mockWeatherAlertBase, 'fahrenheit');
    const heatAlert = alerts.find(a => a.type === 'heat');
    expect(heatAlert).toBeDefined();
    expect(heatAlert?.message).toContain('100°F'); // 38 * 9/5 + 32 = 100.4 -> rounded to 100
  });
});
