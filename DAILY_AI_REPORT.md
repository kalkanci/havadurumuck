# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.
- **Wind Speed Unit Support:** Implemented km/h vs mph toggle.
    - Added `windSpeedUnit` to `AppSettings` type.
    - Added toggle switch to `SettingsModal`.
    - Implemented `convertWindSpeed` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to pass and display wind speed in the selected unit.
    - Corrected the static metric unit from `km/s` to `km/h` in helper functions (`checkWeatherAlerts`).

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` and `convertWindSpeed` helpers using `vitest`.

## Features
- **API Error Management:** Improved custom API error handling to distinguish between network and HTTP errors.
    - Introduced `ApiError` and `NetworkError` classes in `src/utils/errors.ts`.
    - Updated `fetchWithRetry` in `src/utils/api.ts` to throw `ApiError` and `NetworkError` appropriately.
    - Gracefully handled custom API and Network errors in `src/services/astronomyService.ts` to ensure consistent fallbacks and prevent unhandled promise rejections.

## Testing
- **Unit Tests:** Added full test coverage for API error handling in `src/utils/__tests__/api.test.ts` utilizing `vi.useFakeTimers()` to ensure retry and timeout functions evaluate perfectly.
