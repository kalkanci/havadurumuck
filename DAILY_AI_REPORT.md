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

## UI & Animation Features
- **Weather Overlay Reintegration:** Integrated `WeatherOverlay` within `Background.tsx` to display real-time animated weather effects (rain, snow, fog, sun) directly over the background image based on current weather conditions.
- **CSS Animations:** Implemented missing `.weather-*` CSS animation keyframes and classes inside `src/styles/responsive.css` to support `WeatherOverlay` features without breaking other styles.
- **Unit Tests:** Added unit test coverage for `Background.tsx` to verify that the `WeatherOverlay` mounts correctly under specific weather codes.
