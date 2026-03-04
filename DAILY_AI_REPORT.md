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

## Features
- **Dynamic Temperature Unit Formatting:** Updated `generateSmartAdvice` and `checkWeatherAlerts` to format text dynamically using the user's preferred temperature unit (Celsius/Fahrenheit), instead of hardcoding Celsius values in output strings.

## Testing
- **Unit Tests:** Added unit tests for `generateSmartAdvice` and `checkWeatherAlerts` to verify that text formats correctly for both Celsius and Fahrenheit.
