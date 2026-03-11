# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.
- **API Error Handling Improvement:** Refactored `src/utils/api.ts` to implement strict error boundaries by throwing robust custom errors (`ApiError`, `NetworkError`). Updated `src/services/weatherService.ts` to natively consume these error types rather than manually executing `.ok` validations, enhancing API resilience and simplifying standard service operations.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **API Tests:** Added full test coverage for the `fetchWithRetry` function in `src/utils/__tests__/api.test.ts`, asserting correct exponential backoff, rate limit handling, and robust `ApiError`/`NetworkError` rejection patterns.
