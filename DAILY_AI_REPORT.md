# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.
- **API Error Handling:** Refactored `fetchWithRetry` in `src/utils/api.ts` to throw custom `ApiError` and `NetworkError` classes instead of generic `Error` instances.
    - Updated `weatherService.ts` to consume the new error types without explicitly checking `!res.ok`.
    - Updated `astronomyService.ts` to use `fetchWithRetry` instead of native `fetch` and gracefully fallback when encountering custom errors.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **API Tests:** Created `src/utils/__tests__/api.test.ts` to verify `fetchWithRetry` correctly throws `ApiError` on HTTP errors (e.g., 500, 404, 429) and `NetworkError` on network failures, as well as checking retry timeout resolution.
