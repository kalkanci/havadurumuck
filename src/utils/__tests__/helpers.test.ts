import { describe, it, expect } from 'vitest';
import { convertTemperature, convertWindSpeed } from '../helpers';

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
