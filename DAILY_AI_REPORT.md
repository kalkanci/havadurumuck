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
\n- **API Error Handling:** Introduced  class with specific error codes. Updated  and  to throw typed errors. Improved  catch block to display precise, localized user messages based on the error code.

- **API Error Handling:** Introduced `AppError` class with specific error codes. Updated `fetchWithRetry` and `weatherService.ts` to throw typed errors. Improved `App.tsx` catch block to display precise, localized user messages based on the error code.
