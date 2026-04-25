# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.
- **Search Hook Refactor:** Extracted the debounce logic from `Search.tsx` into a reusable `useDebounce` hook (`src/utils/hooks.ts`). This adheres to Clean Code principles and simplifies the component.
- **Dead Code Elimination:** Removed the deprecated `geminiService.ts` file.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.
- **API Error Handling:** Improved `weatherService.ts` by catching errors specifically for the secondary Air Quality (AQI) fetch inside `Promise.all()`. This prevents a failure in the AQI service from crashing the entire weather data load.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper and `useDebounce` hook using `vitest`.
