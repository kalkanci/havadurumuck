# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Refactoring / Optimization
- **API Error Handling:** Refactored `src/utils/api.ts` to export custom `ApiError` and `NetworkError` classes. Updated `fetchWithRetry` to throw these errors.
- **Service Resilience:** Updated `astronomyService` and `weatherService` functions to gracefully catch the custom errors instead of failing silently or unexpectedly. Ensured AQI fallback logic works correctly without breaking the rest of the weather data.
- **Weather Alerts Dynamism:** Fixed a bug where weather alerts did not recalculate when changing temperature units. Alerts in `App.tsx` now update dynamically, and warnings are formatted properly (e.g., "100°F" instead of "38°F").

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`. Added logic-checking tests for `checkWeatherAlerts` verifying unit parsing format and conversion.
