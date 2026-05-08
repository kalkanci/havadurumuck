# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.
- **Wind Speed Unit Support:** Implemented km/h vs mph toggle.
    - Added `windSpeedUnit` to `AppSettings` type.
    - Added toggle switch to `SettingsModal`.
    - Implemented `convertWindSpeed` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to pass and display wind speed in the selected unit.
    - Corrected the static metric unit from `km/s` to `km/h` in helper functions (`checkWeatherAlerts`).

## Features
- **API Error Handling:** Improved Air Quality (AQI) fetch logic in `weatherService.ts`. Replaced simple `Promise.all` with `.catch(() => null)` for the AQI request. This prevents a potential AQI API failure from blocking the core weather data, improving app resilience.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` and `convertWindSpeed` helpers using `vitest`.
- **Weather Service Tests:** Added `src/services/__tests__/weatherService.test.ts` to verify fallback behavior of `fetchWeather` when AQI fetch fails.
