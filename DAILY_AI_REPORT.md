# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.
- **Global Error Handling:** Created a generic `ErrorBoundary` component to catch uncaught rendering errors and provide a visually appealing fallback UI, preventing total application crashes and white screens.

## Features
- **API Error Management:** Implemented robust API error management.
    - Defined custom `ApiError` and `NetworkError` classes in `src/utils/errors.ts`.
    - Refactored `fetchWithRetry` in `src/utils/api.ts` to properly throw `ApiError` with HTTP status codes and `NetworkError` for fetch failures.
    - Updated `astronomyService.ts` to use `fetchWithRetry` and handle these specific errors correctly.
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
- **Application Flow:** Confirmed the application still loads correctly and that existing unit tests continue to pass after introducing custom Error classes and an Error Boundary.
