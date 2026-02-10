import { describe, it, expect } from 'vitest';
import { convertTemperature, getUnitLabel } from '../units';

describe('Unit Conversion Utils', () => {
    describe('convertTemperature', () => {
        it('should return rounded celsius when unit is celsius', () => {
            expect(convertTemperature(10.5, 'celsius')).toBe(11);
            expect(convertTemperature(20, 'celsius')).toBe(20);
            expect(convertTemperature(-5.1, 'celsius')).toBe(-5);
        });

        it('should convert celsius to fahrenheit correctly', () => {
            // (0 * 9/5) + 32 = 32
            expect(convertTemperature(0, 'fahrenheit')).toBe(32);
            // (100 * 9/5) + 32 = 212
            expect(convertTemperature(100, 'fahrenheit')).toBe(212);
            // (20 * 9/5) + 32 = 36 + 32 = 68
            expect(convertTemperature(20, 'fahrenheit')).toBe(68);
            // (-10 * 9/5) + 32 = -18 + 32 = 14
            expect(convertTemperature(-10, 'fahrenheit')).toBe(14);
        });
    });

    describe('getUnitLabel', () => {
        it('should return ° for celsius', () => {
             expect(getUnitLabel('celsius')).toBe('°');
        });

        it('should return °F for fahrenheit', () => {
            expect(getUnitLabel('fahrenheit')).toBe('°F');
        });
    });
});
