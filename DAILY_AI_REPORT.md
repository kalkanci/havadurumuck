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

## API Error Handling
- **Custom Errors:** Added `ApiError` and `NetworkError` classes to `src/utils/api.ts` to standardize network and HTTP errors.
- **Improved fetchWithRetry:** Updated `fetchWithRetry` to explicitly throw these new custom errors when it encounters non-retriable statuses or exhausts retries.
- **Weather Service Reliability:** Ensured that `fetchWeather` in `src/services/weatherService.ts` correctly utilizes this concurrent error-handling setup for weather and AQI fetches.
- **API Tests:** Added unit tests for `fetchWithRetry` in `src/utils/__tests__/api.test.ts`.
