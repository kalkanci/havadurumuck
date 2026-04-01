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
- **Search Component Refactor:** Extracted the search debounce logic into a generic, reusable `useDebounce` hook, addressing an outstanding refactoring checklist item.
- **Alert & Advice Unit Support:** Updated `generateSmartAdvice`, `generateFallbackAdvice`, and `checkWeatherAlerts` to accept and process temperature unit configurations dynamically. Added corresponding tests.
