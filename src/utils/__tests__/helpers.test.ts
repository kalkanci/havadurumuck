import { describe, it, expect } from 'vitest';
import { convertTemperature, convertWindSpeed, generateSmartAdvice } from '../helpers';

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

describe('convertWindSpeed', () => {
  it('should return kmh as is', () => {
    expect(convertWindSpeed(10, 'kmh')).toBe(10);
    expect(convertWindSpeed(0, 'kmh')).toBe(0);
    expect(convertWindSpeed(50, 'kmh')).toBe(50);
  });

  it('should convert kmh to mph', () => {
    // 10 km/h = 6.21371 mph
    expect(convertWindSpeed(10, 'mph')).toBeCloseTo(6.21371, 5);
    // 0 km/h = 0 mph
    expect(convertWindSpeed(0, 'mph')).toBe(0);
    // 100 km/h = 62.1371 mph
    expect(convertWindSpeed(100, 'mph')).toBeCloseTo(62.1371, 4);
  });
});

describe('generateSmartAdvice', () => {
    // Tests for smart advice based on temperatures
    const baseWeather = {
        current: {
            temperature_2m: 20,
            weather_code: 0,
            wind_speed_10m: 10,
            is_day: 1
        },
        daily: {
            precipitation_probability_max: [0],
            uv_index_max: [0]
        },
        air_quality: { european_aqi: 20 }
    } as any;

    it('should generate advice based on unit passed', () => {
        let weatherHot = { ...baseWeather, current: { ...baseWeather.current, temperature_2m: 35 } };
        let adviceCelcius = generateSmartAdvice(weatherHot, 'celsius');
        expect(adviceCelcius.mood).toBe("Kavurucu");

        let weatherCold = { ...baseWeather, current: { ...baseWeather.current, temperature_2m: 0 } };
        let adviceCelciusCold = generateSmartAdvice(weatherCold, 'celsius');
        expect(adviceCelciusCold.mood).toBe("Dondurucu");
    });

    it('should generate fahrenheit correctly', () => {
        let weatherHot = { ...baseWeather, current: { ...baseWeather.current, temperature_2m: 35 } };
        let adviceFahrenheit = generateSmartAdvice(weatherHot, 'fahrenheit');
        expect(adviceFahrenheit.mood).toBe("Kavurucu");
    });
});
