# Daily AI Report

## Refactoring
- **TodayView Extraction:** Extracted the "Today" tab rendering logic from `App.tsx` into a new `src/components/TodayView.tsx` component. This reduced `App.tsx` size by ~100 lines and improved modularity.
- **Error Handling:** Created a strongly typed `AppError` class in `src/utils/AppError.ts`. Updated `src/utils/api.ts` and `src/services/weatherService.ts` to throw `AppError` on network or API failures instead of generic errors.
- **Application Logic Extraction:** Extracted the state, effects, and handlers from `src/App.tsx` into a custom hook `src/hooks/useWeatherApp.ts`. This adhered to Clean Code principles, significantly improving readability and separating data fetching/management from the UI layer. Updated `App.tsx` to handle the typed `AppError` mapping for better user-facing feedback.

## Features
- **Temperature Unit Support:** Implemented Celsius/Fahrenheit toggle.
    - Added `temperatureUnit` to `AppSettings`.
    - Added toggle switch in `SettingsModal`.
    - Implemented `convertTemperature` helper in `src/utils/helpers.ts`.
    - Updated `TodayView`, `HourlyForecast`, `DailyForecast`, and `DetailsGrid` to respect the selected unit.

## Testing
- **Unit Tests:** Added unit tests for `convertTemperature` helper using `vitest`. Added unit tests for `AppError` class in `src/utils/__tests__/AppError.test.ts`.
