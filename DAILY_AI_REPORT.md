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

## AI Update - 2026-04-06
### Refactoring
- **useGeolocation Hook:** Extracted geolocation logic from `App.tsx` into `src/utils/useGeolocation.ts`, adhering to Clean Code principles and making `App.tsx` cleaner.
### Features
- **Share Weather:** Added `ShareButton.tsx` to allow sharing current weather details using the Web Share API (with a clipboard fallback), integrated into `TodayView.tsx`.
