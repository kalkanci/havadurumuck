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

## 2024-xx-xx Refactoring & Feature Additions
- **API Error Handling (`src/utils/api.ts`):**
    - Implemented `ApiError` and `NetworkError` custom exception classes.
    - Updated `fetchWithRetry` to correctly throw these errors instead of quietly passing failed `!res.ok` responses, improving error granularity.
- **Service Layer Updates (`astronomyService.ts`, `weatherService.ts`):**
    - Refactored all data fetching to use the robust `fetchWithRetry`.
    - Handled Air Quality (AQI) fetch failures independently, so that weather data still loads even if AQI fails.
- **Testing (`src/utils/__tests__/api.test.ts`):**
    - Created unit tests using `vitest` to verify asynchronous retry behavior and error throwing logic. Tests verify both `ApiError` and `NetworkError` behaviors across mocked network environments.
