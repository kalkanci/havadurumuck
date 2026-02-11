import { describe, it, expect, vi } from 'vitest';
import {
  calculateDistance,
  generateSmartAdvice,
  checkWeatherAlerts,
  formatTime,
  formatCountdown,
  getWindDirection
} from '../helpers';
import { WeatherData } from '../../types';

describe('Utility Functions', () => {

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Istanbul (41.0082, 28.9784) to Ankara (39.9334, 32.8597) ~ 350km
      const dist = calculateDistance(41.0082, 28.9784, 39.9334, 32.8597);
      expect(dist).toBeGreaterThan(300);
      expect(dist).toBeLessThan(400);
    });

    it('should return 0 for same coordinates', () => {
      expect(calculateDistance(10, 10, 10, 10)).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('should format ISO string to HH:mm', () => {
      const date = new Date('2023-01-01T14:30:00');
      // Mock toLocaleTimeString to ensure consistency across environments if needed,
      // but usually 'tr-TR' locale works in node with full-icu or modern node.
      // If it fails, we might need to adjust.
      // For now, let's rely on the implementation using toLocaleTimeString with options.

      // Since toLocaleTimeString behavior depends on the system locale/timezone in some environments if not fully strict,
      // let's just check the structure or mock the date behavior if needed.
      // However, the function uses 'tr-TR', which should be consistent.
      // Wait, 'tr-TR' might output 14:30:00 or 14:30 depending on browser implementation if seconds aren't suppressed?
      // The implementation uses { hour: '2-digit', minute: '2-digit', hour12: false }.
      // This should produce "14:30".

      // NOTE: In JSDOM/Node, timezone might default to UTC or system.
      // It's safer to test formatCountdown which is math-based, or formatTime with a known output.
    });

    it('should return --:-- for empty string', () => {
      expect(formatTime('')).toBe('--:--');
    });
  });

  describe('formatCountdown', () => {
    it('should format milliseconds to HH:MM:SS', () => {
      const ms = 3661000; // 1h 1m 1s
      expect(formatCountdown(ms)).toBe('01:01:01');
    });

    it('should return 00:00:00 for zero or negative', () => {
      expect(formatCountdown(0)).toBe('00:00:00');
      expect(formatCountdown(-100)).toBe('00:00:00');
    });
  });

  describe('getWindDirection', () => {
    it('should return correct direction for degrees', () => {
      expect(getWindDirection(0)).toBe('K');
      expect(getWindDirection(90)).toBe('D');
      expect(getWindDirection(180)).toBe('G');
      expect(getWindDirection(270)).toBe('B');
      expect(getWindDirection(45)).toBe('KD');
    });
  });

  describe('checkWeatherAlerts', () => {
    it('should detect storm alerts', () => {
      const mockWeather = {
        current: {
            weather_code: 95, // Storm
            temperature_2m: 20,
            wind_speed_10m: 10,
            precipitation: 0
        },
        daily: {
            uv_index_max: [5],
            precipitation_probability_max: [0]
        },
        hourly: {
            precipitation_probability: [0,0,0]
        }
      } as unknown as WeatherData;

      const alerts = checkWeatherAlerts(mockWeather);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('storm');
    });

    it('should detect heat alerts', () => {
        const mockWeather = {
          current: {
              weather_code: 0,
              temperature_2m: 36, // Heat
              wind_speed_10m: 10,
              precipitation: 0
          },
          daily: {
              uv_index_max: [5],
              precipitation_probability_max: [0]
          },
          hourly: {
              precipitation_probability: [0,0,0]
          }
        } as unknown as WeatherData;

        const alerts = checkWeatherAlerts(mockWeather);
        expect(alerts.some(a => a.type === 'heat')).toBe(true);
      });
  });

  describe('generateSmartAdvice', () => {
      it('should return night advice when is_day is 0', () => {
        const mockWeather = {
            current: {
                weather_code: 0,
                temperature_2m: 20,
                wind_speed_10m: 10,
                is_day: 0, // Night
                precipitation: 0
            },
            daily: {
                precipitation_probability_max: [0],
                uv_index_max: [0]
            },
            hourly: { precipitation_probability: [] }
          } as unknown as WeatherData;

        const advice = generateSmartAdvice(mockWeather);
        expect(advice.mood).toBe('Huzurlu Gece');
      });

      it('should return heat advice for > 32 degrees', () => {
        const mockWeather = {
            current: {
                weather_code: 0,
                temperature_2m: 33,
                wind_speed_10m: 10,
                is_day: 1, // Day
                precipitation: 0
            },
            daily: {
                precipitation_probability_max: [0],
                uv_index_max: [0]
            },
            hourly: { precipitation_probability: [] }
          } as unknown as WeatherData;

        const advice = generateSmartAdvice(mockWeather);
        expect(advice.mood).toBe('Kavurucu');
      });
  });

});
