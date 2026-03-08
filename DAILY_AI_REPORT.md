# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

- **API Error Management Improvement:** Implemented structured error handling.
    - Created `AppError` class extending `Error` to throw typed errors (`NETWORK`, `API`, `GPS`, `UNKNOWN`).
    - Updated `fetchWithRetry` in `src/utils/api.ts` to throw `AppError` with `NETWORK` code.
    - Updated `fetchWeather` in `src/services/weatherService.ts` to throw `AppError` with `API` code on bad responses or invalid JSON format.
    - Updated `loadWeather` in `src/App.tsx` to handle specific typed errors using `err instanceof AppError` and display precise error messages for network and API issues.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **E2E/Verification:** Verified the custom UI error messages for both Network errors and API errors using Playwright. All tests passed.
