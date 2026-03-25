// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// Mock dependencies
vi.mock('../../constants', () => ({
  getWeatherLabel: vi.fn(() => 'clear sky')
}));

// Mock WeatherOverlay to see if it receives props correctly
vi.mock('../WeatherOverlay', () => ({
  default: ({ weatherCode }: { weatherCode: number }) => (
    <div data-testid="weather-overlay">Code: {weatherCode}</div>
  )
}));

import Background from '../Background';

describe('Background', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders WeatherOverlay when weatherCode is provided', () => {
    const { getByTestId } = render(<Background city="Istanbul" weatherCode={95} />);
    const overlay = getByTestId('weather-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay.textContent).toBe('Code: 95');
  });

  it('does not render WeatherOverlay when weatherCode is undefined', () => {
    const { queryByTestId } = render(<Background city="Istanbul" />);
    const overlay = queryByTestId('weather-overlay');
    expect(overlay).not.toBeInTheDocument();
  });
});
