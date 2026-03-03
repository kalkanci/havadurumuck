# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.
- **State Logic Extraction:** Extracted the massive state logic and API handling from `App.tsx` into a custom hook `useWeatherApp`.
- **Pull To Refresh:** Extracted pull-to-refresh logic from `App.tsx` into a custom hook `usePullToRefresh`.

## Features
- **API Error Handling:** Created a dedicated `AppError` class for handling and typing API errors (NETWORK, API, GPS, UNKNOWN).
- **Offline Indicator:** Added a new `Toast` UI component to notify users when they are offline.
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`.
