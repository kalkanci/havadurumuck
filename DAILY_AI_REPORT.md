# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.
- **Hook Extraction:** Extracted core application logic from `App.tsx` into `src/hooks/useWeatherApp.ts` and `src/hooks/usePullToRefresh.ts`. This significantly improved separation of concerns and testability.
- **Error Handling:** Introduced `AppError` class and updated `src/services/weatherService.ts` to throw typed errors (NETWORK, API, GPS).

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.
- **Offline Support:** Implemented an "Offline Mode" indicator using `navigator.onLine` state within `useWeatherApp`.
- **Enhanced Error UI:** Updated the error screen to display specific messages based on error type (e.g., GPS vs Network) and added a manual "Retry" mechanism.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
- **Hook Tests:** Added comprehensive unit tests for `useWeatherApp` and `usePullToRefresh` hooks, verifying state initialization, GPS handling, and error states.
