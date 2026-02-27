// @vitest-environment jsdom
import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import TodayView from '../TodayView';

// Mock dependencies
vi.mock('../WeatherAlerts', () => ({ default: () => <div data-testid="weather-alerts" /> }));
vi.mock('../HolidayCard', () => ({ default: () => <div data-testid="holiday-card" /> }));
vi.mock('../AdviceCard', () => ({ default: () => <div data-testid="advice-card" /> }));
vi.mock('../ForecastInsight', () => ({ default: () => <div data-testid="forecast-insight" /> }));
vi.mock('../HourlyForecast', () => ({ default: () => <div data-testid="hourly-forecast" /> }));
vi.mock('../SpotifyCard', () => ({ default: () => <div data-testid="spotify-card" /> }));
vi.mock('../GoldenHourCard', () => ({ default: () => <div data-testid="golden-hour-card" /> }));
vi.mock('../ActivityScore', () => ({ default: () => <div data-testid="activity-score" /> }));
vi.mock('../AirQualityCard', () => ({ default: () => <div data-testid="air-quality-card" /> }));
vi.mock('../DetailsGrid', () => ({ default: () => <div data-testid="details-grid" /> }));

const mockWeather = {
  current: {
    temperature_2m: 20,
    weather_code: 0,
    is_day: 1,
    wind_speed_10m: 10,
    wind_direction_10m: 180,
    precipitation: 0,
    relative_humidity_2m: 50,
    apparent_temperature: 20,
    surface_pressure: 1013,
    cloud_cover: 0,
    dew_point_2m: 10,
    time: "2024-01-01T12:00"
  },
  daily: {
    temperature_2m_max: [25],
    temperature_2m_min: [15],
    time: ["2024-01-01"],
    weather_code: [0],
    apparent_temperature_max: [25],
    apparent_temperature_min: [15],
    sunrise: ["2024-01-01T06:00"],
    sunset: ["2024-01-01T18:00"],
    uv_index_max: [5],
    precipitation_probability_max: [0],
    precipitation_sum: [0],
    precipitation_hours: [0],
    wind_speed_10m_max: [10],
    wind_gusts_10m_max: [15],
    wind_direction_10m_dominant: [180]
  },
  hourly: {
    time: ["2024-01-01T12:00"],
    temperature_2m: [20],
    weather_code: [0],
    is_day: [1],
    wind_speed_10m: [10],
    wind_direction_10m: [180],
    precipitation_probability: [0]
  },
  latitude: 0,
  longitude: 0,
  generationtime_ms: 0,
  utc_offset_seconds: 0,
  elevation: 0,
  current_units: {}
};

const mockLocation = {
  id: 1,
  name: "Istanbul",
  latitude: 41,
  longitude: 28,
  country: "Türkiye"
};

describe('TodayView Component Share Feature', () => {
  let originalNavigatorShare: any;
  let originalClipboard: any;

  beforeEach(() => {
    originalNavigatorShare = navigator.share;
    originalClipboard = navigator.clipboard;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'share', { value: originalNavigatorShare, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
    cleanup();
  });

  it('uses navigator.share when available', async () => {
    const mockShare = vi.fn().mockResolvedValue(true);
    Object.defineProperty(navigator, 'share', { value: mockShare, configurable: true, writable: true });

    const mockToast = vi.fn();

    render(
      <TodayView
        weather={mockWeather}
        location={mockLocation}
        alerts={[]}
        upcomingHolidays={[]}
        distanceToStation={10}
        onOpenCalendar={() => {}}
        onOpenFavorites={() => {}}
        unit="celsius"
        onShowToast={mockToast}
      />
    );

    const shareButton = screen.getByLabelText('Paylaş');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith('Hava durumu paylaşıldı!', 'success');
    });
  });

  it('falls back to clipboard when navigator.share is not available', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });

    const mockWriteText = vi.fn().mockResolvedValue(true);
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
        writable: true
    });

    const mockToast = vi.fn();

    render(
      <TodayView
        weather={mockWeather}
        location={mockLocation}
        alerts={[]}
        upcomingHolidays={[]}
        distanceToStation={10}
        onOpenCalendar={() => {}}
        onOpenFavorites={() => {}}
        unit="celsius"
        onShowToast={mockToast}
      />
    );

    const shareButton = screen.getByLabelText('Paylaş');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith('Bağlantı kopyalandı!', 'success');
    });
  });
});
