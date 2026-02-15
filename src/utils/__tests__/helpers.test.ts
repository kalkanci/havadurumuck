import { describe, it, expect } from 'vitest';
import { convertTemp } from '../helpers';

describe('convertTemp', () => {
  it('should return celsius value if unit is celsius', () => {
    expect(convertTemp(25, 'celsius')).toBe(25);
    expect(convertTemp(0, 'celsius')).toBe(0);
    expect(convertTemp(-10, 'celsius')).toBe(-10);
  });

  it('should convert celsius to fahrenheit if unit is fahrenheit', () => {
    expect(convertTemp(0, 'fahrenheit')).toBe(32);
    expect(convertTemp(100, 'fahrenheit')).toBe(212);
    expect(convertTemp(-40, 'fahrenheit')).toBe(-40);
    expect(convertTemp(25, 'fahrenheit')).toBe(77);
    // Floating point check
    expect(convertTemp(37, 'fahrenheit')).toBeCloseTo(98.6);
  });
});
