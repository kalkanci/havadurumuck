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
- **API Error Management:** Improved error handling across all fetch calls.
    - Created `ApiError` and `NetworkError` custom classes in `src/utils/errors.ts`.
    - Updated `fetchWithRetry` in `src/utils/api.ts` to explicitly throw `ApiError` and `NetworkError`.
    - Refactored `weatherService.ts` to elegantly catch and handle independent AQI failures inside `Promise.all`.
    - Refactored `astronomyService.ts` to use `fetchWithRetry` and handle custom errors appropriately.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` and `convertWindSpeed` helpers using `vitest`.
- **API Error Handling Tests:** Added unit tests for `fetchWithRetry` covering HTTP statuses (500, 404, 429), Network errors, and correct retry limits using Vitest's `vi.useFakeTimers()`.
