import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CurrentWeather from '../CurrentWeather';
import { WeatherData, GeoLocation } from '../../types';

// Mock the weather data
const mockWeather: WeatherData = {
  latitude: 41.0,
  longitude: 29.0,
  generationtime_ms: 0,
  utc_offset_seconds: 10800,
  elevation: 0,
  current_units: {},
  current: {
    time: '2023-10-27T12:00',
    temperature_2m: 25.4,
    relative_humidity_2m: 50,
    apparent_temperature: 26,
    is_day: 1,
    precipitation: 0,
    weather_code: 0, // Clear sky
    wind_speed_10m: 10,
    surface_pressure: 1013,
    cloud_cover: 0,
    wind_direction_10m: 180,
    dew_point_2m: 15
  },
  hourly: {
    time: [],
    temperature_2m: [],
    weather_code: [],
    is_day: [],
    wind_speed_10m: [],
    wind_direction_10m: [],
    precipitation_probability: []
  },
  daily: {
    time: [],
    weather_code: [0],
    temperature_2m_max: [30.1],
    temperature_2m_min: [19.8],
    apparent_temperature_max: [],
    apparent_temperature_min: [],
    sunrise: [],
    sunset: [],
    uv_index_max: [],
    precipitation_probability_max: [],
    precipitation_sum: [],
    precipitation_hours: [],
    wind_speed_10m_max: [],
    wind_gusts_10m_max: [],
    wind_direction_10m_dominant: []
  }
};

const mockLocation: GeoLocation = {
  id: 1,
  name: 'Istanbul',
  latitude: 41.0,
  longitude: 29.0,
  country: 'Turkey',
  countryCode: 'TR',
  admin1: 'Istanbul'
};

describe('CurrentWeather Component', () => {
  it('renders temperature correctly', () => {
    render(
      <CurrentWeather
        weather={mockWeather}
        location={mockLocation}
        todayStr="27 Ekim Cuma"
        onCalendarClick={() => {}}
        onLocationClick={() => {}}
      />
    );

    // Check for temperature (rounded)
    expect(screen.getByText('25')).toBeInTheDocument();

    // Check for high/low temps
    expect(screen.getByText(/30/)).toBeInTheDocument();
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });

  it('renders location name correctly', () => {
    render(
      <CurrentWeather
        weather={mockWeather}
        location={mockLocation}
        todayStr="27 Ekim Cuma"
        onCalendarClick={() => {}}
        onLocationClick={() => {}}
      />
    );

    expect(screen.getByText('Istanbul')).toBeInTheDocument();
  });

  it('calls onLocationClick when location button is clicked', () => {
    const handleClick = vi.fn();
    render(
      <CurrentWeather
        weather={mockWeather}
        location={mockLocation}
        todayStr="27 Ekim Cuma"
        onCalendarClick={() => {}}
        onLocationClick={handleClick}
      />
    );

    const locationButton = screen.getByText('Istanbul').closest('button');
    fireEvent.click(locationButton!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
