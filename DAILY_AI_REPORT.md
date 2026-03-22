# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.
- **API Error Handling:** Refactored `src/utils/api.ts` to implement custom `ApiError` and `NetworkError` classes. Replaced manual status checks in `weatherService.ts` and `astronomyService.ts` to rely directly on the errors thrown by `fetchWithRetry`.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **API Resilience Tests:** Added unit tests for `fetchWithRetry` in `src/utils/__tests__/api.test.ts` to verify exponential backoff, success paths, and proper throwing of custom `ApiError` and `NetworkError` classes.
