# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.

## Refactoring & Features (2nd Pass)
- **Wind Speed Unit Support:** Implemented toggle between km/h and mph.
    - Updated `AppSettings` interface.
    - Added `convertWindSpeed` to `helpers.ts` with unit tests.
    - Added UI toggle in `SettingsModal.tsx`.
    - Integrated `windSpeedUnit` logic in `TodayView`, `HourlyForecast`, `DailyForecast`, `DetailsGrid`, `ActivityScore`, and `ForecastInsight`.
