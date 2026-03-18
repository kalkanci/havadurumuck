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
- **API Tests:** Added unit tests for enhanced `fetchWithRetry` logic checking `ApiError` and `NetworkError` scenarios.

## Error Handling
- **API Resiliency:** Replaced raw `throw Error` with domain-specific `ApiError` and `NetworkError` classes. Refactored `weatherService` and `astronomyService` to handle failures gracefully.

## PWA
- **Service Worker:** Added programmatic registration of `sw.js` in `src/index.tsx` to enable proper offline caching and installation features.
