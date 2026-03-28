# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Refactoring - API Error Handling
- **API Error Classes:** Created custom `ApiError` and `NetworkError` classes to distinguish between API rejections and network failures in `src/utils/api.ts`.
- **Fetch With Retry:** Upgraded `fetchWithRetry` to automatically throw these detailed errors instead of relying on manual `res.ok` checks inside individual services.
- **Graceful Fallbacks:**
    - Updated `weatherService.ts` to fetch AQI data concurrently using `Promise.all` but gracefully catch failures (`.catch(() => null)`) to ensure the main weather payload always renders successfully.
    - Updated `astronomyService.ts` to utilize the new `fetchWithRetry` while explicitly catching both new errors to return the standard `FALLBACK_DATA`.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **API Utilities Tests:** Developed comprehensive unit tests for `fetchWithRetry` using `vi.useFakeTimers()` to validate correct backoff calculation, automatic retry handling, and specific error types being thrown upon failure.
