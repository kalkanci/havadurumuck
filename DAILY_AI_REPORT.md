# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Features
- **API Error Handling Improvement:**
    - Improved `fetchWithRetry` in `src/utils/api.ts` by creating custom `ApiError` and `NetworkError` classes to distinguish between network failures and HTTP errors (4xx, 5xx).
    - Updated `src/services/weatherService.ts` to rely on the errors thrown by `fetchWithRetry` instead of manually throwing generic errors.
    - Updated error display logic in `src/App.tsx` to provide users with specific error messages such as "İnternet bağlantınızı kontrol edin." (NetworkError) and "Servis geçici olarak yoğun, lütfen bekleyin." (429 ApiError).

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **Unit Tests:** Added comprehensive unit tests for `fetchWithRetry` in `src/utils/__tests__/api.test.ts` to ensure exponential backoff, retry mechanisms, and custom error classes are functioning properly.
