# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## API Error Management
- **Custom Error Classes:** Implemented `ApiError` and `NetworkError` in `src/utils/api.ts`.
- **Enhanced Retry Logic:** Updated `fetchWithRetry` to throw these explicit custom errors upon encountering fatal issues or after retrying.
- **Service Integration:** Refactored `weatherService.ts` and `astronomyService.ts` to seamlessly catch `ApiError` and `NetworkError`, removing brittle `!res.ok` checks across files.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **API Tests:** Created `api.test.ts` to verify exponential backoff logic, retry concurrency, and correct throwing of `ApiError` / `NetworkError`.
