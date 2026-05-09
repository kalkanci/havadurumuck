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

## Features
- **Dynamic Temperature Alerts & Advice:**
    - Updated `generateSmartAdvice` and `generateFallbackAdvice` to accept a unit parameter.
    - Updated `checkWeatherAlerts` to dynamically format temperature warnings (e.g., Extreme Heat) in the correct unit (Celsius/Fahrenheit).
    - Added a `useEffect` hook in `App.tsx` to recalculate and translate weather alerts immediately when the user changes the temperature unit from settings, without needing a network refresh.
    - Updated `AdviceCard.tsx` and `TodayView.tsx` to pipe the unit preference through correctly.
