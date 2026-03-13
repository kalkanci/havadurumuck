# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.
- **Enhanced API Error Handling:** Introduced structured error classes (`ApiError` and `NetworkError`) and updated `fetchWithRetry` to throw them for robust error tracking. Updated `weatherService.ts` and `astronomyService.ts` to utilize these errors while preserving concurrent fetching and graceful fallbacks.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **API Tests:** Added comprehensive tests for `fetchWithRetry`, `ApiError`, and `NetworkError` in `src/utils/__tests__/api.test.ts`.
