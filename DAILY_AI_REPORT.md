# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.
    - Applied temperature unit to weather alerts dynamically in `checkWeatherAlerts`.
    - Applied temperature unit to AI advice formatting in `generateSmartAdvice` and `generateFallbackAdvice`.

## Optimizations
- **Performance:** Removed `temperatureUnit` from the `loadWeather` `useEffect` dependency array in `App.tsx` to prevent unnecessary API refetches. Alerts are now recalculated client-side when the unit changes without an API call.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper and `checkWeatherAlerts` using `vitest`.
