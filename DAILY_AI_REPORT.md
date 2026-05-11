# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.

## Features
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
- **Dynamic Units in Insights and Alerts:** Refactored `checkWeatherAlerts` and `ForecastInsight` components.
    - Updated `checkWeatherAlerts` to format message text dynamically based on the selected unit.
    - Updated `App.tsx`'s `useEffect` hook to recalculate alerts on setting change.
    - Updated `ForecastInsight` to accept user selected units and convert metrics in `getSummaryAnalysis` before calculations.
    - Dynamically adjusted difference thresholds for varying units (e.g., automatically adjusting the 1.5°C temperature difference threshold to 2.7°F for Fahrenheit users).
